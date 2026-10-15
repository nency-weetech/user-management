import { INestApplication } from '@nestjs/common';
import { setUpSocketApp } from './utils/setup-socket-app';
import { closeTestApp } from './utils/setup-app';
import { cleanDatabase } from './utils/db-cleanup';
import { cleanRedis } from './utils/redis-cleanup';
import Redis from 'ioredis';
import Request from 'supertest';
import { Socket } from 'socket.io-client';
import {
  connectSocket,
  createUserAndGetToken,
  createTestRoom,
  waitForEvent,
} from './utils/socket-test-helper';

describe('Chat Join Requests (e2e)', () => {
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

  it('full loop: request → live admin notification → approve → live requester notification → auto-rejoin', async () => {
    const admin = await createUserAndGetToken(app, 'jr-admin@test.com');
    const room = await createTestRoom(app, admin.userId, 'Private Room');

    const adminSocket = connectSocket(baseUrl, admin.accessToken);
    sockets.push(adminSocket);
    await waitForEvent(adminSocket, 'connect');
    adminSocket.emit('join_room', { roomId: room.id });
    await waitForEvent(adminSocket, 'room_joined');

    const adminNotificationPromise = waitForEvent<{
      requestId: string;
      roomId: string;
      requesterName: string;
    }>(adminSocket, 'join_request_pending');

    const requester = await createUserAndGetToken(
      app,
      'jr-requester@test.com',
      {
        firstName: 'Priya',
      },
    );
    const requesterSocket = connectSocket(baseUrl, requester.accessToken);
    sockets.push(requesterSocket);
    await waitForEvent(requesterSocket, 'connect');

    requesterSocket.emit('join_room', { roomId: room.id });
    const submitted = await waitForEvent<{ roomId: string }>(
      requesterSocket,
      'join_request_submitted',
    );
    expect(submitted.roomId).toBe(room.id);

    // Admin should have received the live notification
    const adminNotification = await adminNotificationPromise;
    expect(adminNotification.roomId).toBe(room.id);
    expect(adminNotification.requesterName).toBe('Priya');

    // Set up the requester's listener BEFORE approving, to avoid a race
    const requesterApprovedPromise = waitForEvent<{ roomId: string }>(
      requesterSocket,
      'join_request_approved',
    );

    // Admin approves via the REAL REST endpoint (matches production usage)
    await Request(app.getHttpServer())
      .post(
        `/rooms/${room.id}/join-request/${adminNotification.requestId}/approve-request`,
      )
      .set('Cookie', [`accessToken=${admin.accessToken}`])
      .expect(201);

    const approved = await requesterApprovedPromise;
    expect(approved.roomId).toBe(room.id);

    const roomJoinedPromise = waitForEvent<{ roomId: string }>(
      requesterSocket,
      'room_joined',
    );
    requesterSocket.emit('join_room', { roomId: room.id });
    const joined = await roomJoinedPromise;
    expect(joined.roomId).toBe(room.id);

    const { getDataSourceToken } = await import('@nestjs/typeorm');
    const dataSource = app.get(getDataSourceToken());
    const membershipRows = await dataSource.query(
      `SELECT * FROM room_members WHERE user_id = $1 AND room_id = $2`,
      [requester.userId, room.id],
    );
    expect(membershipRows).toHaveLength(1);
  });

  it('full loop: request → reject → requester notified, no membership created', async () => {
    const admin = await createUserAndGetToken(app, 'jr-admin2@test.com');
    const room = await createTestRoom(app, admin.userId, 'Private Room 2');

    const adminSocket = connectSocket(baseUrl, admin.accessToken);
    sockets.push(adminSocket);
    await waitForEvent(adminSocket, 'connect');
    adminSocket.emit('join_room', { roomId: room.id });
    await waitForEvent(adminSocket, 'room_joined');

    const adminNotificationPromise = waitForEvent<{ requestId: string }>(
      adminSocket,
      'join_request_pending',
    );

    const requester = await createUserAndGetToken(
      app,
      'jr-requester2@test.com',
    );
    const requesterSocket = connectSocket(baseUrl, requester.accessToken);
    sockets.push(requesterSocket);
    await waitForEvent(requesterSocket, 'connect');

    requesterSocket.emit('join_room', { roomId: room.id });
    await waitForEvent(requesterSocket, 'join_request_submitted');

    const adminNotification = await adminNotificationPromise;

    const requesterRejectedPromise = waitForEvent<{ roomId: string }>(
      requesterSocket,
      'join_request_rejected',
    );

    await Request(app.getHttpServer())
      .post(
        `/rooms/${room.id}/join-request/${adminNotification.requestId}/reject-request`,
      )
      .set('Cookie', [`accessToken=${admin.accessToken}`])
      .expect(201);

    const rejected = await requesterRejectedPromise;
    expect(rejected.roomId).toBe(room.id);

    const { getDataSourceToken } = await import('@nestjs/typeorm');
    const dataSource = app.get(getDataSourceToken());
    const membershipRows = await dataSource.query(
      `SELECT * FROM room_members WHERE user_id = $1 AND room_id = $2`,
      [requester.userId, room.id],
    );
    expect(membershipRows).toHaveLength(0);
  });
});
