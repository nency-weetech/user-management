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

describe('Chat Message (e2e)', () => {
  let app: INestApplication;
  let baseUrl: string;
  let redis: Redis;
  let sockets: Socket[] = [];

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

  it('persists a message and broadcasts it with real id/createdAt', async () => {
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

    socket.emit('send_message', { roomId: room.id, message: 'Hello world' });

    const recevied = await waitForEvent<{
      id: string;
      senderId: string;
      roomId: string;
      message: string;
      created_at: string;
    }>(socket, 'new_message');

    expect(recevied.id).toBeTruthy();
    expect(recevied.senderId).toBe(userId);
    expect(recevied.roomId).toBe(room.id);
    expect(recevied.message).toBe('Hello world');
    expect(recevied.created_at).toBeTruthy();
  });

  it('rejects send_message from a user who is NOT a member (defense-in-depth check)', async () => {
    const owner = await createUserAndGetToken(app, 'owner@test.com');
    const room = await createTestRoom(app, owner.userId, 'Private Chat room');

    const outsider = await createUserAndGetToken(app, 'outsider@test.com');
    const socket = connectSocket(baseUrl, outsider.accessToken);
    sockets.push(socket);
    await waitForEvent(socket, 'connect');

    socket.emit('send_message', { roomId: room.id, message: 'Hello world' });

    const error = await waitForEvent<{ message: string }>(
      socket,
      'send_message_error',
    );
    expect(error.message).toMatch(/not a member/i);
  });

  it('actually saves the message row to the database', async () => {
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

    socket.emit('send_message', { roomId: room.id, message: 'check the db' });

    const recevied = await waitForEvent<{ id: string }>(socket, 'new_message');

    const {getDataSourceToken} = await import('@nestjs/typeorm');

    const datasource = await app.get(getDataSourceToken());
    const saved = await datasource.query(`
            SELECT * FROM message WHERE id=$1
        `,[recevied.id])

    expect(saved).toHaveLength(1);
    expect(saved[0].content).toBe('check the db');
  });
});
