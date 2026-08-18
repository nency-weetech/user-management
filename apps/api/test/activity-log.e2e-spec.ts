// test/activity-log.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import Redis from 'ioredis';
import { cleanDatabase } from './utils/db-cleanup';
import { cleanRedis } from './utils/redis-cleanup';
import { closeTestApp, setUpApp } from './utils/setup-app';
import bcrypt from 'bcrypt';
import { UsersService } from '../src/users/users.service';
import { UserRole } from '@myapp/database';

describe('Activity Log (e2e)', () => {
  let app: INestApplication;
  let redis: Redis;
  let accessToken: string;
  let userService: UsersService;
  let userId: string = '';

  beforeAll(async () => {
    app = await setUpApp();
    userService = app.get<UsersService>(UsersService);
    redis = new Redis({ host: 'localhost', port: 6379, db: 1 });
  });

  afterEach(async () => {
    await cleanDatabase(app);
    await cleanRedis(redis);
  });

  afterAll(async () => {
    if (userId) {
      await redis.del(`activity:${userId}`);
    }
    await redis.quit();
    await closeTestApp(app);
  });

  const plainPassword = 'password@123';

  async function createVerifiedUser(
    email: string,
    overrides: Partial<any> = {},
  ) {
    const hash = await bcrypt.hash(plainPassword, 10);
    return userService.create({
      email,
      password: hash,
      firstName: 'new',
      lastName: 'user',
      isEmailVerified: true,
      isActive: true,
      role: UserRole.USER,
      ...overrides,
    });
  }

  it('should log a LOGIN activity when user logs in', async () => {
    await createVerifiedUser('login@user.com');

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'login@user.com', password: 'password@123' })
      .expect(201);

    accessToken = loginRes.body.accessToken;
    userId = loginRes.body.user.id;

    const rawEntries = await redis.lrange(`activity:${userId}`, 0, -1);

    expect(rawEntries.length).toBe(1);

    const parsed = JSON.parse(rawEntries[0]);
    expect(parsed.action).toBe('LOGIN');
  });

  it('should return activity via GET endpoint', async () => {
    await createVerifiedUser('login@user.com');

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'login@user.com', password: 'password@123' })
      .expect(201);

    accessToken = loginRes.body.accessToken;
    userId = loginRes.body.user.id;

    const res = await request(app.getHttpServer())
      .get(`/auth/${userId}/activity`)
      .set('Cookie', `accessToken=${accessToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].action).toBe('LOGIN');
  });

  it('should cap activity log at max entries (LTRIM working)', async () => {
    await createVerifiedUser('login@user.com');

    for (let i = 0; i < 8; i++) {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'login@user.com', password: 'password@123' })
        .expect(201);
    }

    const rawEntries = await redis.lrange(`activity:${userId}`, 0, -1);
    expect(rawEntries.length).toBeLessThan(6);
  });

  it('should show most recent activity first', async () => {
    await createVerifiedUser('login@user.com');

    const first = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'login@user.com', password: 'password@123' })
      .expect(201);
    userId = first.body.user.id;

    await new Promise((resolved) => setTimeout(resolved, 100));

    const sec = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'login@user.com', password: 'password@123' })
      .expect(201);
    userId = sec.body.user.id;

    const rawEntries = await redis.lrange(`activity:${userId}`, 0, -1);

    const parsed = rawEntries.map((e) => JSON.parse(e));

    const firstTimeStamp = new Date(parsed[0].timestamp).getTime();
    const secondTimeStamp = new Date(parsed[1].timestamp).getTime();

    expect(firstTimeStamp).toBeGreaterThanOrEqual(secondTimeStamp);
  });

  it('should reject activity log request without auth token', async() => {
    const res = await request(app.getHttpServer())
      .get(`/auth/${userId}/activity`)
      .expect(401);
  })
});
