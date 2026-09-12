import { INestApplication } from '@nestjs/common';
import Redis from 'ioredis';
import { Socket } from 'socket.io-client';
import * as Minio from 'minio';
import { setUpSocketApp } from './utils/setup-socket-app';
import { cleanDatabase } from './utils/db-cleanup';
import { cleanRedis } from './utils/redis-cleanup';
import { cleanMinioTestBucket } from './utils/minio-cleanup';
import { closeTestApp } from './utils/setup-app';
import {
  connectSocket,
  createTestRoom,
  createUserAndGetToken,
  uploadTestFile,
  waitForEvent,
} from './utils/socket-test-helper';
describe('Chat attachments (e2e)', () => {
  let app: INestApplication;
  let baseUrl: string;
  let sockets: Socket[] = [];
  let redis: Redis;
  let minioClient: Minio.Client;
  const testBucket = 'chat-attachments-test';

  beforeAll(async () => {
    ({ app, baseUrl } = await setUpSocketApp());
    redis = new Redis({ host: 'localhost', port: 6379, db: 1 });
    minioClient = new Minio.Client({
      endPoint: 'localhost',
      port: 9000,
      useSSL: false,
      accessKey: 'minioadmin',
      secretKey: 'minioadmin123',
    });
  });

  afterEach(async () => {
    sockets.forEach((s) => s.disconnect());
    sockets = [];

    await cleanDatabase(app);
    await cleanRedis(redis);
    await cleanMinioTestBucket(minioClient, testBucket);
  });

  afterAll(async () => {
    await redis.quit();
    await closeTestApp(app);
  });

  it('A member requesting an upload URL gets back a valid fileKey + signed URL', async () => {
    const { userId, accessToken } = await createUserAndGetToken(
      app,
      'test@user.com',
    );
    const room = await createTestRoom(app, userId, 'general');

    const socket = connectSocket(baseUrl, accessToken);
    sockets.push(socket);
    await waitForEvent(socket, 'connect');
    socket.emit('join_room', { roomId: room.id });
    await waitForEvent(socket, 'room_joined');

    socket.emit('request_upload_url', {
      roomId: room.id,
      filename: 'test.txt',
    });
    const result = await waitForEvent<{ fileKey: string; uploadUrl: string }>(
      socket,
      'upload_url_ready',
    );
    expect(result.fileKey).toContain(room.id);
    expect(result.uploadUrl).toContain('X-Amz-Signature');
  });

  it('rejects upload URL requests from a non-member', async () => {
    const owneruser = await createUserAndGetToken(app, 'test@user.com');
    const room = await createTestRoom(app, owneruser.userId, 'general');

    const nrmlUser = await createUserAndGetToken(app, 'outsider@test.com');

    const socket = connectSocket(baseUrl, nrmlUser.accessToken);
    sockets.push(socket);
    await waitForEvent(socket, 'connect');

    socket.emit('request_upload_url', {
      roomId: room.id,
      filename: 'tets.txt',
    });
    const error = await waitForEvent<{ message: string }>(
      socket,
      'upload_url_error',
    );

    expect(error.message).toMatch(/not a member/i);
  });

  it('saves file fields and broadcasts a working fileUrl after a real upload', async () => {
    const { userId, accessToken } = await createUserAndGetToken(
      app,
      'test@user.com',
    );
    const room = await createTestRoom(app, userId, 'general');

    const socket = connectSocket(baseUrl, accessToken);
    sockets.push(socket);
    await waitForEvent(socket, 'connect');

    socket.emit('join_room', { roomId: room.id });
    await waitForEvent(socket, 'room_joined');

    const { fileKey } = await uploadTestFile(
      socket,
      room.id,
      'test.txt',
      Buffer.from('This is test file'),
    );

    const newMessagePromise = waitForEvent<{
      id: string;
      fileUrl: string;
      fileType: string;
      fileName: string;
    }>(socket, 'new_message');

    socket.emit('send_message', {
      roomId: room.id,
      message: '',
      fileKey,
      fileName: 'test.txt',
      fileType: 'text/plan',
    });

    const received = await newMessagePromise;

    expect(received.fileName).toBe('test.txt');
    expect(received.fileType).toBe('text/plan');
    expect(received.fileUrl).toContain('X-Amz-Signature');

    const downloadRes = await fetch(received.fileUrl);
    expect(downloadRes.ok).toBe(true);

    const connect = await downloadRes.text();
    expect(connect).toBe('This is test file');
  });

  it('regenerates a fresh working download URL when history is loaded', async () => {
    const { userId, accessToken } = await createUserAndGetToken(
      app,
      'test@user.com',
    );
    const room = await createTestRoom(app, userId, 'general');

    const socket = connectSocket(baseUrl, accessToken);
    sockets.push(socket);
    await waitForEvent(socket, 'connect');

    socket.emit('join_room', { roomId: room.id });
    await waitForEvent(socket, 'room_joined');

    const { fileKey } = await uploadTestFile(
      socket,
      room.id,
      'test.txt',
      Buffer.from('this is buffer'),
    );

    socket.emit('send_message', {
      roomId: room.id,
      message: '',
      fileKey,
      fileName: 'test.txt',
      fileType: 'text/plan',
    });

    await waitForEvent(socket, 'new_message');

    socket.emit('get_history', {roomId: room.id})
    const history = await waitForEvent<{messages: any[]}>(socket, 'message_history')

    expect(history.messages).toHaveLength(1)

    const historyMessage = history.messages[0]

    expect(historyMessage.fileName).toBe('test.txt')
    expect(historyMessage.fileUrl).toContain('X-Amz-Signature');

    const downloadRes = await fetch(historyMessage.fileUrl)
    expect(downloadRes.ok).toBe(true);
    const content = await downloadRes.text() 
    expect(content).toBe('this is buffer');
  });

  it('rejects a message with neither text nor a file attachment', async () => {
    const {userId, accessToken} = await createUserAndGetToken(app, 'test@user.com')
    const room = await createTestRoom(app, userId, 'general')

    const socket = connectSocket(baseUrl, accessToken)
    sockets.push(socket)
    await waitForEvent(socket, 'connect')

    socket.emit('join_room', {roomId: room.id})
    await waitForEvent(socket, 'room_joined')

    socket.emit('send_message', {roomId: room.id, message : ''})

    const error = await waitForEvent<{message: string}>(socket, 'send_message_error')
    expect(error.message).toBeTruthy();
  })
});
