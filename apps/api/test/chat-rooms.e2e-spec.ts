import { INestApplication } from '@nestjs/common';
import Redis from 'ioredis';
import { Socket } from 'socket.io-client';
import { setUpSocketApp } from './utils/setup-socket-app';
import { cleanDatabase } from './utils/db-cleanup';
import { cleanRedis } from './utils/redis-cleanup';
import { closeTestApp } from './utils/setup-app';
import {
  connectSocket,
  createTestRoom,
  createUserAndGetToken,
  waitForEvent,
} from './utils/socket-test-helper';

describe('Chat Room (e2e)', () => {
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

  it('joins a room successfully when already a member', async () => {
    const { userId, accessToken } = await createUserAndGetToken(
      app,
      'user@test.com',
    );
    const room = await createTestRoom(app, userId, 'general');

    const socket = connectSocket(baseUrl, accessToken);
    sockets.push(socket);
    await waitForEvent(socket, 'connect');

    socket.emit('join_room', { roomId: room.id });
    const joined = await waitForEvent<{ roomId: string }>(
      socket,
      'room_joined',
    );

    expect(joined.roomId).toBe(room.id);
  });

  it('auto-files a join request instead of joining when NOT a member', async () => {
    const owner = await createUserAndGetToken(app, 'owner@test.com');
    const room = await createTestRoom(app, owner.userId, 'Private Chat room');

    const outsider = await createUserAndGetToken(app, 'outsider@test.com');
    const socket = connectSocket(baseUrl, outsider.accessToken);
    sockets.push(socket);
    await waitForEvent(socket, 'connect');

    socket.emit('join_room', { roomId: room.id });
    const submitted = await waitForEvent<{ roomId: string; message: string }>(
      socket,
      'join_request_submitted',
    );

    expect(submitted.roomId).toBe(room.id);
  });

  it('rejects joining a room that does not exist', async () => {
    const outsider = await createUserAndGetToken(app, 'outsider@test.com');
    const socket = connectSocket(baseUrl, outsider.accessToken);
    sockets.push(socket);
    await waitForEvent(socket, 'connect');

    const fake_roomId = '00000000-0000-0000-0000-000000000000'
    socket.emit('join_room', {roomId: fake_roomId})

    const error = await waitForEvent<{message: string}>(socket, 'join_room_error');
    expect(error.message).toMatch(/not found/i);
  });
});
