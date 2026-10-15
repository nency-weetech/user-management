import { INestApplication } from '@nestjs/common';
import { closeTestApp, setUpApp } from './utils/setup-app';
import Redis from 'ioredis';
import { Queue, QueueEvents } from 'bullmq';
import { getQueueToken } from '@nestjs/bullmq';
import { cleanDatabase } from './utils/db-cleanup';
import { cleanRedis } from './utils/redis-cleanup';
import Request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';

describe('Mail Queue(e2e)', () => {
  let app: INestApplication;
  let redis: Redis;
  let mailQueue: Queue;
  let authService: AuthService;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    redis = new Redis({ host: 'localhost', port: 6379, db: 1 });
    authService = app.get<AuthService>(AuthService);
    mailQueue = app.get<Queue>(getQueueToken('mailQueue'));
  });

  afterEach(async () => {
    await cleanDatabase(app);
    await cleanRedis(redis);
    await mailQueue.obliterate({ force: true });
  });

  afterAll(async () => {
    await redis.quit();
    await mailQueue.close();
    await closeTestApp(app);
  });
  it('/', () => {
    return Request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Mail test!');
  });

  //   test('should queue a verification OTP email job when triggered', async () => {
  //     const testEmail = 'test@userInfo.com';
  //     const regRes = await Request(app.getHttpServer())
  //       .post('/auth/signUp')
  //       .send({
  //         email: testEmail,
  //         password: 'testPass123',
  //         firstName: 'user',
  //         lastName: 'test',
  //       });

  //     expect(regRes.body.message).toContain('Register successfull!');

  //     const allJobs = await mailQueue.getJobs([
  //       'waiting',
  //       'active',
  //       'completed',
  //       'failed',
  //       'delayed',
  //     ]);

  //     const job = allJobs.find((u) => u.data.toEmail === testEmail && u.data.otp);

  //     expect(job).toBeDefined();
  //     expect(job?.name).toBe('send-verification-OTP');
  //     expect(job?.data.otp).toBeDefined();
  //   });

  //   it('should process the job and mark it completed', async () => {
  //     const testEmail = 'test@userInfo.com';
  //     const regRes = await Request(app.getHttpServer())
  //       .post('/auth/signUp')
  //       .send({
  //         email: testEmail,
  //         password: 'testPass123',
  //         firstName: 'user',
  //         lastName: 'test',
  //       });

  //     const queueEvents = new QueueEvents('mailQueue', {
  //       connection: mailQueue.opts.connection,
  //     });

  //     const jobCompletedPromise = new Promise<void>((resolve, reject) => {
  //       const timeout = setTimeout(
  //         () => reject(new Error('Job completion timed out')),
  //         8000,
  //       );
  //       queueEvents.on('completed', async ({ jobId }) => {
  //         const job = await mailQueue.getJob(jobId);
  //         if (job && job.data.toEmail === testEmail && job.data.otp) {
  //           clearTimeout(timeout);
  //           resolve();
  //         }
  //       });
  //     });

  //     await jobCompletedPromise;
  //     await queueEvents.close();

  //     const completedJobs = await mailQueue.getJobs(['completed']);
  //     const job = completedJobs.find(
  //       (j) => j.data.toEmail === testEmail && j.data.otp,
  //     );

  //     expect(job).toBeDefined();
  //     expect(await job?.getState()).toBe('completed');
  //   });

  //     it('should complete full flow: signup → queue job → verify email with OTP', async () => {
  //       const testEmail = 'test@user.com';
  //       const regRes = await Request(app.getHttpServer())
  //         .post('/auth/signUp')
  //         .send({
  //           email: testEmail,
  //           password: 'passwrod@123',
  //           firstName: 'user',
  //           lastName: 'test',
  //         });

  //       expect(regRes.body.message).toContain('Register successfull!');

  //       const regiJobs = await mailQueue.getJobs(['waiting', 'active', 'delayed']);

  //       const job = regiJobs.find(
  //         (j) => j.data.toEmail === testEmail && j.data.otp,
  //       );

  //       expect(job?.data.otp).toBeDefined();
  //       expect(job?.name).toBe('send-verification-OTP');

  //       const rawOtp = job?.data.otp;

  //       await new Promise((resolve) => setTimeout(resolve, 500));

  //       const verifyRes = await Request(app.getHttpServer())
  //         .post('/auth/verify-email')
  //         .send({ email: testEmail, otp: rawOtp });

  //       expect(verifyRes.body.message).toBeDefined();
  //       expect(verifyRes.body.message).toContain('Email verify successfully!');

  //       await new Promise((resolve) => setTimeout(resolve, 2000));

  //       const verifyJobs = await mailQueue.getJobs([
  //         'waiting',
  //         'active',
  //         'completed',
  //         'failed',
  //         'delayed',
  //       ]);
  //       const verifyJob = verifyJobs.find(
  //         (j) => j.data.toEmail === testEmail && j.name === 'send-welcome',
  //       );

  //       if (verifyJob) {
  //         const state = await verifyJob.getState();
  //         console.log(state);
  //       }
  //       expect(job?.data).toBeDefined();
  //       expect(verifyJob?.name).toBe('send-welcome');
  //     });
});
