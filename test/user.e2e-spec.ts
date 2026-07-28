import { INestApplication, Req, Search } from '@nestjs/common';
import { App } from 'supertest/types';
import { closeTestApp, setUpApp } from './utils/setup-app';
import { cleanDatabase } from './utils/db-cleanup';
import Request from 'supertest';

import { UsersService } from 'src/users/users.service';
import { UserRole } from 'src/users/enums/user-role.enum';
import * as jwt from 'jsonwebtoken';
import Redis from 'ioredis';
import { cleanRedis } from './utils/redis-cleanup';

describe('User (e2e)', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let adminUser: any;
  let normalUser: any;
  let adminToken: string;
  let userToken: string;
  let redis : Redis;

  beforeAll(async () => {
    app = await setUpApp();
    redis = new Redis({host: 'localhost', port: 6379, db: 1})
    usersService = app.get<UsersService>(UsersService);
  });

  beforeEach(async () => {
    adminUser = await usersService.create({
      email: 'admin@test.com',
      password: 'hashed',
      firstName: 'admin',
      lastName: 'test',
      role: UserRole.ADMIN,
      isActive: true,
      isEmailVerified: true,
    });
    normalUser = await usersService.create({
      email: 'user@test.com',
      password: 'hashed',
      firstName: 'user',
      lastName: 'test',
      role: UserRole.USER,
      isActive: true,
      isEmailVerified: true,
    });

    adminToken = jwt.sign(
      { userId: adminUser.id, email: adminUser.email, role: adminUser.role },
      process.env.ACCESS_JWT_SECRET as string,
    );
    userToken = jwt.sign(
      { userId: normalUser.id, email: normalUser.email, role: normalUser.role },
      process.env.ACCESS_JWT_SECRET as string,
    );
  });

  afterEach(async () => {
    await cleanDatabase(app);
    await cleanRedis(redis);
  });

  afterAll(async () => {
    await redis.quit()
    await closeTestApp(app);
  });

  describe('GET /users (Paginated Admin Listing)', () => {
    it('should return 401 Unauthorized if no bearer token is provided', async () => {
      await Request(app.getHttpServer()).get('/users').expect(401);
    });

    it('should return 403 Forbidden if normal user requests the user list', async () => {
      const res = await Request(app.getHttpServer())
        .get('/users')
        .set('Cookie', `access_token=${userToken}`)
        .expect(403);
    });

    it('should return paginated user list with metadata for Admin', async () => {
      const res = await Request(app.getHttpServer())
        .get('/users')
        .query({ page: 1, limit: 10 })
        .set('Cookie', `access_token=${adminToken}`)
        .expect(200);

      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.meta).toMatchObject({
        totalItems: expect.any(Number),
        itemsCount: expect.any(Number),
        itemsPerPage: 10,
        totalPage: expect.any(Number),
        currentPage: 1,
        hasNextPage: expect.any(Boolean),
        hasPreviousPage: expect.any(Boolean),
      });
    });

    it('should filter users by search query (email matching)', async () => {
      const res = await Request(app.getHttpServer())
        .get('/users')
        .query({ page: 1, limit: 10, search: 'admin' })
        .set('Cookie', `access_token=${adminToken}`)
        .expect(200);

      expect(res.body.data.every((u: any) => u.email.includes('admin'))).toBe(
        true,
      );
    });

    it('should filter users by search role (e.g., role=ADMIN or role=USER)', async () => {
      const res = await Request(app.getHttpServer())
        .get('/users')
        .query({ page: 1, limit: 10, search: UserRole.USER })
        .set('Cookie', `access_token=${adminToken}`)
        .expect(200);

      expect(res.body.data.every((u: any) => u.role.includes('user'))).toBe(
        true,
      );
    });

    it('should filter users by isActive status (e.g., isActive=false)', async () => {
      const res = await Request(app.getHttpServer())
        .get('/users')
        .query({ page: 1, limit: 10, isActive: false })
        .set('Cookie', `access_token=${adminToken}`)
        .expect(200);

      expect(res.body.data.every((u: any) => u.isActice === false)).toBe(true);
    });
  });

  describe('GET /users/:id (Get Single User)', () => {
    it('should return 401 Unauthorized if unauthenticated', async () => {
      await Request(app.getHttpServer())
        .get(`/users/${normalUser.id}`)
        .expect(401);
    });

    it('should return user details if valid ID is provided', async () => {
      const res = await Request(app.getHttpServer())
        .get(`/users/${normalUser.id}`)
        .set('Cookie', `access_token=${adminToken}`)
        .expect(200);

      expect(res.body.id).toBe(normalUser.id);
      expect(res.body.email).toBe(normalUser.email);
      expect(res.body.password).toBeUndefined();
    });

    it('should return 404 Not Found if user ID does not exist', async () => {
      const notExistId = '00000000-0000-0000-0000-000000000000';
      await Request(app.getHttpServer())
        .get(`/users/${notExistId}`)
        .set('Cookie', `access_token=${adminToken}`)
        .expect(404);
    });
  });
});
