import { INestApplication } from '@nestjs/common';
import Redis from 'ioredis';
import { Socket } from 'socket.io-client';
import { setUpSocketApp } from './utils/setup-socket-app';
import { cleanDatabase } from './utils/db-cleanup';
import { cleanRedis } from './utils/redis-cleanup';
import { closeTestApp } from './utils/setup-app';
import {
  connectSocket,
  createUserAndGetToken,
  waitForEvent,
} from './utils/socket-test-helper';

describe('Chat Presence (e2e)', () => {
  let app: INestApplication;
  let baseUrl: string;
  let sockets: Socket[] = [];
  let redis: Redis;

  beforeAll(async () => {
    ({ app, baseUrl } = await setUpSocketApp());
    redis = new Redis({ host: 'localhost', port: 6379, db: 1 });
  });

  afterEach(async () => {
    sockets.forEach((s) => s.disconnect());
    sockets = [];

    await cleanDatabase(app);
    await cleanRedis(redis);
  });

  afterAll(async () => {
    await redis.quit();
    await closeTestApp(app);
  });

  it('marks a user online in Redis and broadcasts user_online', async () => {
    const userA = await createUserAndGetToken(app, 'presence-a@test.com');
    const userB = await createUserAndGetToken(app, 'presence-b@test.com');

    const socketB = connectSocket(baseUrl, userB.accessToken);
    sockets.push(socketB);
    await waitForEvent(socketB, 'connect');
    socketB.emit('register_presence');
    await waitForEvent(socketB, 'user_online');

    const BObservedAOnline = waitForEvent<{ userId: string }>(
      socketB,
      'user_online',
    );

    const socketA = connectSocket(baseUrl, userA.accessToken);
    sockets.push(socketA);
    await waitForEvent(socketA, 'connect');
    socketA.emit('register_presence');

    const received = await BObservedAOnline;
    expect(received.userId).toBe(userA.userId);

    const member = await redis.smembers(`online:${userA.userId}`);
    expect(member.length).toBeGreaterThan(0);

    const inIndexMaster = await redis.sismember(`online_users`, userA.userId);
    expect(inIndexMaster).toBe(1);
  });

  it('marks a user offline in Redis and broadcasts user_offline after their last connection drops', async () => {
    const userA = await createUserAndGetToken(app, 'presence-a@test.com');
    const userB = await createUserAndGetToken(app, 'presence-b@test.com');

    const socketA = connectSocket(baseUrl, userA.accessToken);
    sockets.push(socketA);
    await waitForEvent(socketA, 'connect');
    socketA.emit('register_presence');
    await waitForEvent(socketA, 'user_online');

    const socketB = connectSocket(baseUrl, userB.accessToken);
    sockets.push(socketB);
    await waitForEvent(socketB, 'connect');
    socketB.emit('register_presence');
    await waitForEvent(socketB, 'user_online');

    const bObservesAOffline = waitForEvent<{ userId: string }>(
      socketB,
      'user_offline',
    );

    socketA.disconnect();

    const received = await bObservesAOffline;
    expect(received.userId).toBe(userA.userId);

    const members = await redis.smembers(`online:${userA.userId}`);
    expect(members.length).toBe(0);

    const inMasterIndex = await redis.sismember('online_users', userA.userId);
    expect(inMasterIndex).toBe(0);
  });

  it('does NOT broadcast offline while the user still has another tab/connection open', async () => {
    const userA = await createUserAndGetToken(app, 'presence-e@test.com');
    const userB = await createUserAndGetToken(app, 'presence-f@test.com');

    const socketA1 = connectSocket(baseUrl, userA.accessToken);
    sockets.push(socketA1);
    await waitForEvent(socketA1, 'connect');
    socketA1.emit('register_presence');
    await waitForEvent(socketA1, 'user_online');

    const socketA2 = connectSocket(baseUrl, userA.accessToken);
    sockets.push(socketA2);
    await waitForEvent(socketA2, 'connect');
    socketA2.emit('register_presence');
    await new Promise((resolve) => setTimeout(resolve, 200)); 

    const socketB = connectSocket(baseUrl, userB.accessToken);
    sockets.push(socketB);
    
    await waitForEvent(socketB, 'connect');
    socketB.emit('register_presence');
    await waitForEvent(socketB, 'user_online');

    let bReceivedOffline = false;
    socketB.once('user_offline', () => {
      bReceivedOffline = true;
    });

    socketA1.disconnect();

    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(bReceivedOffline).toBe(false);

    const members = await redis.smembers(`online:${userA.userId}`);
    expect(members.length).toBe(1);
  });
});
