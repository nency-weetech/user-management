// import { INestApplication } from '@nestjs/common';
// import Redis from 'ioredis';
// import { closeTestApp, setUpApp } from './utils/setup-app';
// import { UsersService } from '../src/users/users.service';
// import { cleanDatabase } from './utils/db-cleanup';
// import { cleanRedis } from './utils/redis-cleanup';
// import { Test, TestingModule } from '@nestjs/testing';
// import { AppModule } from '../src/app.module';
// import { APP_GUARD } from '@nestjs/core';
// import Request from 'supertest';
// import { ThrottlerGuard, ThrottlerStorage } from '@nestjs/throttler';
// import bcrypt from 'bcrypt';
// import { UserRole } from '@myapp/database';

// describe('Global Throttler (e2e)', () => {
//   let app: INestApplication;
//   let redis: Redis;
//   let userService: UsersService;
//   let throttlerStorage: any;

//   beforeAll(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       imports: [AppModule],
//     })
//       .overrideProvider(APP_GUARD)
//       .useClass(ThrottlerGuard)
//       .compile();

//     app = module.createNestApplication();
//     await app.init();
//     redis = new Redis({ host: 'localhost', port: 6379, db: 1 });
//     userService = app.get<UsersService>(UsersService);
//     throttlerStorage = app.get(ThrottlerStorage);
//   });

//   afterEach(async () => {
//     await cleanDatabase(app);
//     await cleanRedis(redis);
//     throttlerStorage._storage.clear();
//     throttlerStorage.timeoutIds.clear();
//   });

//   afterAll(async () => {
//     await redis.quit();
//     await closeTestApp(app);
//   });

//   it('should block requests after exceeding throttle limit', async () => {
//     for (let i = 0; i < 5; i++) {
//       const res = await Request(app.getHttpServer())
//         .post('/auth/login')
//         .send({ email: 'nonexistent@test.com', password: 'wrong' });

//       expect(res.status).not.toBe(429);
//     }
//     const blockedRes = await Request(app.getHttpServer())
//       .post('/auth/login')
//       .send({ email: 'nonexistent@test.com', password: 'wrong' });

//     expect(blockedRes.status).toBe(429);
//     expect(blockedRes.body.message).toMatch(/ThrottlerException/);
//   });

//   const plainPassword = 'password@123';

//   async function createVerifiedUser(
//     email: string,
//     overrides: Partial<any> = {},
//   ) {
//     const hash = await bcrypt.hash(plainPassword, 10);
//     return userService.create({
//       email,
//       password: hash,
//       firstName: 'new',
//       lastName: 'user',
//       isEmailVerified: true,
//       isActive: true,
//       role: UserRole.USER,
//       ...overrides,
//     });
//   }

//   it('should rest attempt counter after successful login', async () => {
//     await createVerifiedUser('currect@mail.com');

//     for (let i = 0; i < 3; i++) {
//       await Request(app.getHttpServer())
//         .post('/auth/login')
//         .send({ email: 'currect@mail.com', password: 'wrongPassword' })
//         .expect(401);
//     }

//     const result = await Request(app.getHttpServer())
//       .post('/auth/login')
//       .send({ email: 'currect@mail.com', password: 'password@123' });

//     expect(result.status).toBe(201);
//   });

//   it('should throttle based on request volume, not success/failure of login', async () => {
//     await createVerifiedUser('throttle3@test.com');

//     const res1 = await Request(app.getHttpServer())
//       .post('/auth/login')
//       .send({ email: 'throttle3@test.com', password: 'wrongPassword' })
//       .expect(401);

//     await Request(app.getHttpServer())
//       .post('/auth/login')
//       .send({ email: 'throttle3@test.com', password: 'password@123' })
//       .expect(201);
//     console.log(throttlerStorage._storage);

//     await Request(app.getHttpServer())
//       .post('/auth/login')
//       .send({ email: 'throttle3@test.com', password: 'wrongPassword' })
//       .expect(401);

//     await Request(app.getHttpServer())
//       .post('/auth/login')
//       .send({ email: 'throttle3@test.com', password: 'wrongPassword' })
//       .expect(401);

//     await Request(app.getHttpServer())
//       .post('/auth/login')
//       .send({ email: 'throttle3@test.com', password: 'wrongPassword' })
//       .expect(401);

//     const blockedRes = await Request(app.getHttpServer())
//       .post('/auth/login')
//       .send({ email: 'throttle3@test.com', password: 'correctPass123' });
//     console.log(throttlerStorage._storage);

//     expect(blockedRes.status).toBe(429);
//   });

//   it('should throttle independently per client (different test runs use fresh state)', async () => {
//     await createVerifiedUser('throttle4@test.com');

//     const res = await Request(app.getHttpServer())
//       .post('/auth/login')
//       .send({ email: 'throttle4@test.com', password: 'wrongPassword' });

//     expect([401, 429]).toContain(res.status);
//   });
// });
