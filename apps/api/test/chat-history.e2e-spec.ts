import { INestApplication } from '@nestjs/common';
import Redis from 'ioredis';
import { Socket } from 'socket.io-client';
import { setUpSocketApp } from './utils/setup-socket-app';
import { cleanDatabase } from './utils/db-cleanup';
import { cleanRedis } from './utils/redis-cleanup';
import { closeTestApp } from './utils/setup-app';
import {
  addTestMember,
  connectSocket,
  createTestRoom,
  createUserAndGetToken,
  waitForEvent,
} from './utils/socket-test-helper';

describe('Chat History (e2e)', () => {
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

  it('returns full history for a member who was present for all messages', async () => {
    const { userId, accessToken } = await createUserAndGetToken(
      app,
      'user@test.com',
    );
    const room = await createTestRoom(app, userId, 'general');

    const socket = connectSocket(baseUrl, accessToken);
    sockets.push(socket);
    await waitForEvent(socket, 'connect');

    socket.emit('join_room', { roomId: room.id });
    await waitForEvent<{ roomId: string }>(socket, 'room_joined');

    socket.emit('send_message', { roomId: room.id, message: 'first' });
    await waitForEvent<{ id: string }>(socket, 'new_message');

    socket.emit('send_message', { roomId: room.id, message: 'second' });
    await waitForEvent<{ id: string }>(socket, 'new_message');

    socket.emit('get_history', { roomId: room.id });
    const history = await waitForEvent<{ messages: any[] }>(
      socket,
      'message_history',
    );

    expect(history.messages).toHaveLength(2);
    expect(history.messages[0].message).toBe('first');
    expect(history.messages[1].message).toBe('second');
  });

  it('does NOT show messages sent before a new member joined', async () => {
    const owner = await createUserAndGetToken(app, 'history-owner@test.com');
    const room = await createTestRoom(app, owner.userId, 'General');

    const ownerSocket = connectSocket(baseUrl, owner.accessToken);
    sockets.push(ownerSocket);

    await waitForEvent(ownerSocket, 'connect');
    ownerSocket.emit('join_room', { roomId: room.id });
    await waitForEvent(ownerSocket, 'room_joined');

    ownerSocket.emit('send_message', {
      roomId: room.id,
      message: 'before you joined',
    });
    await waitForEvent(ownerSocket, 'new_message');

    const newcomer = await createUserAndGetToken(app, 'newcomer@test.com');
    await addTestMember(app, newcomer.userId, room.id);

    const newcomerSocket = connectSocket(baseUrl, newcomer.accessToken);
    sockets.push(newcomerSocket);
  
    await waitForEvent(newcomerSocket, 'connect');
    newcomerSocket.emit('join_room', { roomId: room.id });
    await waitForEvent(newcomerSocket, 'room_joined');

    ownerSocket.emit('send_message', {
      roomId: room.id,
      message: 'after you joined',
    });
    await waitForEvent(ownerSocket, 'new_message');

    newcomerSocket.emit('get_history', { roomId: room.id });
    const history = await waitForEvent<{ messages: any[] }>(
      newcomerSocket,
      'message_history',
    );

    expect(history.messages).toHaveLength(1);
    expect(history.messages[0].message).toBe('after you joined');
  });

  it('returns messages in chronological order (oldest to newest)', async () => {
     const { userId, accessToken } = await createUserAndGetToken(
      app,
      'user@test.com',
    );
    const room = await createTestRoom(app, userId, 'general');

    const socket = connectSocket(baseUrl, accessToken);
    sockets.push(socket);
    await waitForEvent(socket, 'connect');

    socket.emit('join_room', { roomId: room.id });
    await waitForEvent<{ roomId: string }>(socket, 'room_joined');

    for(const text of ['one', 'two', 'three']){
      socket.emit('send_message', {roomId: room.id, message: text})
      await waitForEvent(socket, 'new_message');
    }

    socket.emit('get_history', {roomId: room.id});
    const history = await waitForEvent<{messages : any[]}>(socket, 'message_history');

    expect(history.messages.map((m) => m.message)).toEqual(['one', 'two', 'three'])
  })
});
