import { INestApplication } from '@nestjs/common';
import { closeTestApp, mailCapture, setUpApp } from './utils/setup-app';
import Redis from 'ioredis';
import { UsersService } from 'src/users/users.service';
import { WeeklyReportService } from 'src/weekly-report/weekly-report.service';
import { cleanDatabase } from './utils/db-cleanup';
import { cleanRedis } from './utils/redis-cleanup';
import Request from 'supertest';

describe('Weekly signUp report (e2e)', () => {
  let app: INestApplication;
  let redis: Redis;
  let userService: UsersService;
  let weeklyReportService: WeeklyReportService;

  beforeAll(async () => {
    app = await setUpApp();
    redis = new Redis({ host: 'localhost', port: 6379, db: 1 });
    userService = app.get<UsersService>(UsersService);
    weeklyReportService = app.get<WeeklyReportService>(WeeklyReportService);
  });

  afterEach(async () => {
    await cleanDatabase(app);
    await cleanRedis(redis);
    mailCapture.lastWeeklyReport = null;
  });

  afterAll(async () => {
    await redis.quit();
    await closeTestApp(app);
  });

  it('should report correct count and users who signed up within the last 7 days', async () => {
    const now = new Date();

    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(now.getDate() - 3);

    const tenDaysAgo = new Date(now);
    tenDaysAgo.setDate(now.getDate() - 10);

    await userService.create({
      email: 'recent@test.com',
      password: 'recent123',
      firstName: 'recent',
      lastName: 'user',
    });

    const oldUser = await userService.create({
      email: 'oldUser@test.com',
      password: 'oldUser123',
      firstName: 'old',
      lastName: 'user',
    });

    await userService.updateCreatedAtForTest(oldUser.id, tenDaysAgo);

    await weeklyReportService.sendWeeklySignOutReport();

    expect(mailCapture.lastWeeklyReport).not.toBeNull();
    expect(mailCapture.lastWeeklyReport!.count).toBe(1);
    expect(mailCapture.lastWeeklyReport?.users[0].email).toBe(
      'recent@test.com',
    );
  });

  it('should handle zero signups gracefully', async () => {
    await weeklyReportService.sendWeeklySignOutReport();

    expect(mailCapture.lastWeeklyReport).not.toBeNull();
    expect(mailCapture.lastWeeklyReport!.count).toBe(0);
    expect(mailCapture.lastWeeklyReport!.users).toEqual([]);
  });

  it('should return signups ordered oldest first', async () => {
    await userService.create({
      email: 'first@test.com',
      password: 'first123',
      firstName: 'recent',
      lastName: 'user',
    });

    await new Promise((res) => setTimeout(res, 50));

    await userService.create({
      email: 'second@test.com',
      password: 'second123',
      firstName: 'old',
      lastName: 'user',
    });

    await weeklyReportService.sendWeeklySignOutReport();
    expect(mailCapture.lastWeeklyReport).not.toBeNull();
    expect(mailCapture.lastWeeklyReport!.count).toBe(2);

    const email = mailCapture.lastWeeklyReport!.users.map((u: any) => u.email);
    expect(email).toEqual(['first@test.com', 'second@test.com']);
  });

  describe('Redis signup counter', () => {
    it('should increment on registration and reset after report sent', async () => {
      await Request(app.getHttpServer()).post('/auth/signUp').send({
        email: 'counter1@test.com',
        password: 'first123',
        firstName: 'recent',
        lastName: 'user',
      });

      await Request(app.getHttpServer()).post('/auth/signUp').send({
        email: 'counter2@test.com',
        password: 'second123',
        firstName: 'old',
        lastName: 'user',
      });

      const countBeforeReport = await redis.get('weekly_signup_count');
      expect(countBeforeReport).toBe('2');

      await weeklyReportService.sendWeeklySignOutReport();

      const countAfterReport = await redis.get('weekly_signup_count');
      expect(countAfterReport).toBe('0');
    });
  });
});
