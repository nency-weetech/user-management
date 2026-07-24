import { INestApplication } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { closeTestApp, mailCapture, setUpApp } from './utils/setup-app';
import { cleanDatabase } from './utils/db-cleanup';
import Request from 'supertest';
import { AuthService } from 'src/auth/auth.service';
import bcrypt from 'bcrypt';
import { UserRole } from 'src/users/enums/user-role.enum';
describe('Auth (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let userService: UsersService;

  beforeAll(async () => {
    app = await setUpApp();
    authService = app.get<AuthService>(AuthService);
    userService = app.get<UsersService>(UsersService);
  });

  afterEach(async () => {
    await cleanDatabase(app);
    mailCapture.lastVerificationOtp = null;
    mailCapture.lastResetOtp = null;
  });

  afterAll(async () => {
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
        })
        .expect(201);

      expect(res.body.message).toMatch(/successfully/);
      const user = await userService.findByEmail('dup@email.com');
      expect(user!.isEmailVerified).toBe(true);
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
      await createVerifiedUser('login@user.com', {isEmailVerified : false});

      const res = await Request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'login@user.com', password: 'password@123' })
        .expect(401);
    });
    
    it('should return 401 if account is deactivated', async () => {
       await createVerifiedUser('login@user.com', {isActive : false});

      const res = await Request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'login@user.com', password: 'password@123' })
        .expect(401);
    });
  });
});
