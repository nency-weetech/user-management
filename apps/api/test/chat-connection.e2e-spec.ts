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

describe('Chat connection (e2e)', () => {
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

  it('accept connection with valid token', async () => {
    const { accessToken } = await createUserAndGetToken(
      app,
      'connect@test.com',
    );
    const socket = connectSocket(baseUrl, accessToken);
    sockets.push(socket);

    await waitForEvent(socket, 'connect');
    expect(socket.connected).toBe(true);
  });
});
