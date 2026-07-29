import { INestApplication } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { closeTestApp, mailCapture, setUpApp } from './utils/setup-app';
import { cleanDatabase } from './utils/db-cleanup';
import Request from 'supertest';
import { AuthService } from 'src/auth/auth.service';
import bcrypt from 'bcrypt';
import { UserRole } from 'src/users/enums/user-role.enum';
import { cleanRedis } from './utils/redis-cleanup';
import Redis from 'ioredis';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let userService: UsersService;
  let redis: Redis;
  //let welcomeMail: string;

  beforeAll(async () => {
    app = await setUpApp();
    authService = app.get<AuthService>(AuthService);
    userService = app.get<UsersService>(UsersService);
    redis = new Redis({ host: 'localhost', port: 6379, db: 1 });
  });

  afterEach(async () => {
    await cleanDatabase(app);
    await cleanRedis(redis);
    mailCapture.lastVerificationOtp = null;
    mailCapture.lastResetOtp = null;
    mailCapture.lastWelcomeEmail = null;
  });

  afterAll(async () => {
    await redis.quit();
    await closeTestApp(app);
  });

  describe('POST /auth/register', () => {
    it('should register a new user and send verification OTP', async () => {
      const res = await Request(app.getHttpServer())
        .post('/auth/signUp')
        .send({
          email: 'newuser@test.com',
          password: 'test@1234',
          firstName: 'new',
          lastName: 'user',
        })
        .expect(201);

      expect(res.body.message).toMatch(/Register successfull/);
      expect(mailCapture.lastVerificationOtp).toBeTruthy();

      const user = await userService.findByEmail('newuser@test.com');
      expect(user).toBeTruthy();
      expect(user!.isEmailVerified).toBe(false);
    });

    it('should return 409 Conflict if email already exists', async () => {
      await userService.create({
        email: 'dup@email.com',
        password: 'dupPass@123',
        firstName: 'new',
        lastName: 'user',
        isEmailVerified: true,
      });
      const res = await Request(app.getHttpServer())
        .post('/auth/signUp')
        .send({
          email: 'dup@email.com',
          password: 'dupPass@123',
          firstName: 'new',
          lastName: 'user',
        })
        .expect(409);
    });

    it('should return 400 for invalid payload (missing password)', async () => {
      const res = await Request(app.getHttpServer())
        .post('/auth/signUp')
        .send({
          email: 'dup@email.com',
          firstName: 'new',
          lastName: 'user',
        })
        .expect(400);
    });
  });

  describe('POST /auth/verify-email', () => {
    it('should verify email with correct OTP', async () => {
      await Request(app.getHttpServer())
        .post('/auth/signUp')
        .send({
          email: 'dup@email.com',
          password: 'dupPass@123',
          firstName: 'new',
          lastName: 'user',
        })
        .expect(201);

      const otp = mailCapture.lastVerificationOtp;

      const res = await Request(app.getHttpServer())
        .post('/auth/verify-email')
        .send({
          email: 'dup@email.com',
          otp,
        });

      expect(res.body.message).toMatch(/successfully/);
      const user = await userService.findByEmail('dup@email.com');
      expect(user!.isEmailVerified).toBe(true);
      expect(mailCapture.lastWelcomeEmail).toBe('dup@email.com');
    });

    it('should return 400 for wrong OTP', async () => {
      await Request(app.getHttpServer()).post('/auth/signUp').send({
        email: 'dup@email.com',
        password: 'dupPass@123',
        firstName: 'new',
        lastName: 'user',
      });

      await Request(app.getHttpServer())
        .post('/auth/verify-email')
        .send({
          email: 'dup@email.com',
          otp: '000000',
        })
        .expect(400);
    });
    it('should return 404 if user not found', async () => {
      await Request(app.getHttpServer())
        .post('/auth/verify-email')
        .send({
          email: 'ghost@email.com',
          otp: '123456',
        })
        .expect(404);
    });
    it('should return 400 if already verified', async () => {
      await userService.create({
        email: 'dup@email.com',
        password: 'dupPass@123',
        firstName: 'new',
        lastName: 'user',
        isEmailVerified: true,
      });

      await Request(app.getHttpServer())
        .post('/auth/verify-email')
        .send({
          email: 'dup@email.com',
          otp: '123456',
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
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

    it('should login successfully and return tokens', async () => {
      await createVerifiedUser('login@user.com');

      const res = await Request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'login@user.com', password: 'password@123' })
        .expect(201);

      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      expect(res.body.user.email).toBe('login@user.com');
      expect(res.body.user.password).toBeUndefined();
    });

    it('should return 401 for wrong password', async () => {
      await createVerifiedUser('login@user.com');

      const res = await Request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'login@user.com', password: 'wrongPassword' })
        .expect(401);
    });

    it('should return 401 for non-existent email', async () => {
      await Request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'notValid@user.com', password: 'wrongPassword' })
        .expect(401);
    });

    it('should return 401 if email is not verified', async () => {
      await createVerifiedUser('login@user.com', { isEmailVerified: false });

      const res = await Request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'login@user.com', password: 'password@123' })
        .expect(401);
    });

    it('should return 401 if account is deactivated', async () => {
      await createVerifiedUser('login@user.com', { isActive: false });

      const res = await Request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'login@user.com', password: 'password@123' })
        .expect(401);
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('should send OTP and always return generic message (existing email)', async () => {
      await userService.create({
        email: 'newuser@test.com',
        password: 'test@1234',
        firstName: 'new',
        lastName: 'user',
      });

      const res = await Request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'newuser@test.com' });

      expect(res.body.message).toMatch(/If an account exists/);
      expect(mailCapture.lastResetOtp).toBeTruthy();
    });
    it('should return same generic message for non-existent email (no enumeration)', async () => {
      const res = await Request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'newuser@test.com' });

      expect(res.body.message).toMatch(/If an account exists/);
      expect(mailCapture.lastResetOtp).toBeNull();
    });
  });

  describe('POST /auth/verify-otp', () => {
    it('should verify OTP and return a reset session token', async () => {
      await userService.create({
        email: 'newuser@test.com',
        password: 'test@1234',
        firstName: 'new',
        lastName: 'user',
      });

      await Request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'newuser@test.com' });

      const otp = mailCapture.lastResetOtp;

      const res = await Request(app.getHttpServer())
        .post('/auth/verify-otp')
        .send({ email: 'newuser@test.com', otp });

      expect(res.body.resetSessionToken).toBeDefined();
    });
    it('should return 400 for wrong OTP and decrement remaining attempts', async () => {
      await userService.create({
        email: 'newuser@test.com',
        password: 'test@1234',
        firstName: 'new',
        lastName: 'user',
      });

      const forgotRes = await Request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'newuser@test.com' })
        .expect(201);

      expect(mailCapture.lastResetOtp).toBeTruthy();

      const userAfterForgot = await userService.findByEmail('newuser@test.com');
      expect(userAfterForgot!.passwordResetOtp).toBeTruthy();

      const res = await Request(app.getHttpServer())
        .post('/auth/verify-otp')
        .send({ email: 'newuser@test.com', otp: '000000' })
        .expect(400);

      expect(res.body.message).toMatch(/attempts remaining./);
    });

    it('should invalidate OTP after 3 failed attempts', async () => {
      await userService.create({
        email: 'newuser@test.com',
        password: 'test@1234',
        firstName: 'new',
        lastName: 'user',
      });

      await userService.findByEmail('newuser@test.com');

      await Request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'newuser@test.com' });

      for (let i = 0; i < 3; i++) {
        await Request(app.getHttpServer())
          .post('/auth/verify-otp')
          .send({ email: 'newuser@test.com', otp: '000000' })
          .expect(400);
      }

      const res = await Request(app.getHttpServer())
        .post('/auth/verify-otp')
        .send({ email: 'newuser@test.com', otp: '000000' })
        .expect(400);

      expect(res.body.message).toMatch(/Too many failed attempts/);
    });
  });

  describe('POST /auth/reset-password', () => {
    // it('should reset password with a valid session token', async () => {
    //   await userService.create({
    //     email: 'newuser@test.com',
    //     password: 'test@1234',
    //     firstName: 'new',
    //     lastName: 'user',
    //     isEmailVerified: true,
    //   });

    //   await Request(app.getHttpServer())
    //     .post('/auth/forgot-password')
    //     .send({ email: 'newuser@test.com' });

    //   const otp = mailCapture.lastResetOtp;

    //   const resToken = await Request(app.getHttpServer())
    //     .post('/auth/verify-otp')
    //     .send({ email: 'newuser@test.com', otp });

    //   const resetSessionToken = resToken.body.resetSessionToken;

    //   const res = await Request(app.getHttpServer())
    //     .post('/auth/reset-password')
    //     .send({ resetSessionToken, newPassword: 'newResetPass123' });

    //   expect(res.body.message).toMatch(/reset successfully/);

    //   const log = await Request(app.getHttpServer())
    //     .post('/auth/login')
    //     .send({ email: 'newuser@test.com', password: 'newResetPass123' })
    //     .expect(201);
    // });
    it('should return 401 for invalid/garbage session token', async () => {
      await Request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          resetSessionToken: 'not-ral-token',
          newPassword: 'newResetPass123',
        })
        .expect(401);
    });
  });
  describe('POST /auth/refresh', () => {
    it('should issue new tokens with a valid refresh token', async () => {
      const hash = await bcrypt.hash('password123!', 10);
      const newUser = await userService.create({
        email: 'newuser@test.com',
        password: hash,
        firstName: 'new',
        lastName: 'user',
        isEmailVerified: true,
      });

      const login = await Request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'newuser@test.com', password: 'password123!' });

      await userService.findOne(newUser.id);

      const { refreshToken } = login.body;

      const res = await Request(app.getHttpServer())
        .get('/auth/refresh')
        .set('Cookie', `refreshToken=${refreshToken}`);

      expect(res.body.message).toMatch(/Tokens refreshed successfully/);
    });
    it('should return 401 for reused/invalid refresh token', async () => {
      const refreshToken = 'invalid-refresh-Token';

      await Request(app.getHttpServer())
        .get('/auth/refresh')
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('should clear refresh token on logout', async () => {
      const hash = await bcrypt.hash('password123!', 10);
      const user = await userService.create({
        email: 'newuser@test.com',
        password: hash,
        firstName: 'new',
        lastName: 'user',
        isEmailVerified: true,
      });

      const login = await Request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'newuser@test.com', password: 'password123!' });

      const { refreshToken, accessToken } = login.body;

      const res = await Request(app.getHttpServer())
        .get('/auth/logout')
        .set('Cookie', [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ]);

      const updatedUser = await userService.findOne(user.id);
      expect(updatedUser.refreshToken).toBeNull();
    });
  });
});
