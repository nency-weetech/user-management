import { INestApplication } from '@nestjs/common';
import { closeTestApp, setUpApp } from './utils/setup-app';
import { NewsService } from 'src/news/news.service';
import Redis from 'ioredis';
import { cleanDatabase } from './utils/db-cleanup';
import Request from 'supertest';
import { UsersService } from 'src/users/users.service';
import { UserRole } from 'src/users/enums/user-role.enum';
import bcrypt from 'bcrypt';
import { ArticleRepository } from 'src/news/article.repository';
import { NewsFetchLogRepository } from 'src/news/news-fetch-log.repository';

describe('News (e2e)', () => {
  let app: INestApplication;
  let newsService: NewsService;
  let usersService: UsersService;
  let userToken: string;
  let articleRepository: ArticleRepository;
  let newsFetchLogRepository : NewsFetchLogRepository

  beforeAll(async () => {
    app = await setUpApp();
    newsService = app.get<NewsService>(NewsService);
    usersService = app.get<UsersService>(UsersService);
    articleRepository = app.get<ArticleRepository>(ArticleRepository);
    newsFetchLogRepository = app.get<NewsFetchLogRepository>(NewsFetchLogRepository)
  });

  afterEach(async () => {
    await cleanDatabase(app);
  });
  afterAll(async () => {
    await closeTestApp(app);
  });

  const plainPassword = 'password@123';

  async function createVerifiedUser(
    email: string,
    overrides: Partial<any> = {},
  ) {
    const hash = await bcrypt.hash(plainPassword, 10);
    return usersService.create({
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

  async function createVerifiedAdmin(
    email: string,
    overrides: Partial<any> = {},
  ) {
    const hash = await bcrypt.hash(plainPassword, 10);
    return usersService.create({
      email,
      password: hash,
      firstName: 'new',
      lastName: 'user',
      isEmailVerified: true,
      isActive: true,
      role: UserRole.ADMIN,
      ...overrides,
    });
  }

  describe('GET/news', () => {
    it('should return articles for an authenticated user', async () => {
      await createVerifiedUser('user@test.com');
      const loginUser = await Request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@test.com', password: 'password@123' });

      const { accessToken, refreshToken } = loginUser.body;

      await Request(app.getHttpServer())
        .get('/news')
        .set('Cookie', [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .expect(200);
    });
    it('should return 401 for unauthenticated request', async () => {
      await Request(app.getHttpServer())
        .get('/news')
        .set('Cookie', 'Invalid_token')
        .expect(401);
    });
    it('should support pagination (page, limit params)', async () => {
      await createVerifiedUser('user@test.com');
      const loginUser = await Request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@test.com', password: 'password@123' });

      const { accessToken, refreshToken } = loginUser.body;

      for (let i = 0; i < 5; i++) {
        await articleRepository.upsertArticle({
          externalId: 12345 + i,
          summary: `A test summary ${i}`,
          url: `https://example.com/test-${i}`,
          catagory: 'technology',
          sourceCountry: 'us',
          sentiment: 0.5,
          publishDated: new Date(),
          lastRefreshedAt: new Date(),
        });
      }

      const res = await Request(app.getHttpServer())
        .get('/news')
        .set('Cookie', [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .query({ page: 1, limit: 5 });

      expect(res.body.data.length).toBe(5);
      expect(res.body.meta.total).toBe(5);
      expect(res.body.meta.totalPage).toBe(1);

    });
    it('should filter by category', async () => {
      await createVerifiedUser('user@test.com');
      const loginUser = await Request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@test.com', password: 'password@123' });

      const { accessToken, refreshToken } = loginUser.body;

      const categories = [
        'technology',
        'politics',
        'technology',
        'sports',
        'technology',
      ];
      for (let i = 0; i < 5; i++) {
        await articleRepository.upsertArticle({
          externalId: 12345 + i,
          summary: `A test summary ${i}`,
          url: `https://example.com/test-${i}`,
          catagory: categories[i],
          sourceCountry: 'us',
          sentiment: 0.5,
          publishDated: new Date(),
          lastRefreshedAt: new Date(),
        });
      }

      const res = await Request(app.getHttpServer())
        .get('/news')
        .set('Cookie', [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .query({ page: 1, limit: 5, category: 'technology' });

      expect(res.body.data.length).toBe(3);
      res.body.data.forEach((article: any) => {
        expect(article.catagory).toBe('technology');
      });
    });
  });

  describe('POSt /news/refresh', () => {
    // it('should allow admin to trigger a refresh', async () => {
    //   await createVerifiedAdmin('admin@test.com');

    //   const loginUser = await Request(app.getHttpServer())
    //     .post('/auth/login')
    //     .send({ email: 'admin@test.com', password: 'password@123' });

    //   const { accessToken, refreshToken } = loginUser.body;

    //   const res = await Request(app.getHttpServer())
    //     .post('/news/refresh')
    //     .send({ query: 'business', number: 1 })
    //     .set('Cookie', [
    //       `accessToken=${accessToken}`,
    //       `refreshToken=${refreshToken}`,
    //     ]);

    //     const articles = await articleRepository.findAll()
    //     expect(articles.length).toBeGreaterThan(0)

    //     const log = await newsFetchLogRepository.findRecent(1)
    //     expect(log.length).toBe(1)
    //     expect(log[0].success).toBe(true)
    //     expect(log[0].triggeredBy).toBe('admin')
    // });
    it('should return 403 for regular user', async() => {
      await createVerifiedUser('user@test.com');

      const loginUser = await Request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@test.com', password: 'password@123' });

      const { accessToken, refreshToken } = loginUser.body;

      const res = await Request(app.getHttpServer())
        .post('/news/refresh')
        .send({ query: 'technology', number: 3 })
        .set('Cookie', [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .expect(403)
    });
    it('should return 401 for unauthenticated request', async()=>{
      await Request(app.getHttpServer())
        .post('/news/refresh')
        .send({ query: 'technology', number: 3 })
        .expect(401)
    });
    it('should log a failure if the external API call fails', async () => {
      
    });
  });

//   describe('GET /news/fetch-history', () => {

//   1. "should return fetch logs for admin"
//      - Create some fetch log entries directly via NewsFetchLogRepository (bypass actual fetching)
//      - Call GET /news/fetch-history as admin
//      - Expect 200, logs array returned, correct order (newest first)

//   2. "should return 403 for regular user"
//      - Call as regular user
//      - Expect 403

//   3. "should respect the limit query param"
//      - Insert 5 log entries
//      - Call GET /news/fetch-history?limit=2
//      - Expect only 2 returned
// })

// describe('DELETE /news/:id', () => {

//   1. "should allow admin to delete an article"
//      - Insert an article
//      - Call DELETE /news/:id as admin
//      - Expect 200/204
//      - Verify: article no longer exists in DB (query directly)

//   2. "should return 403 for regular user"

//   3. "should return 404 for nonexistent article"
//      - Call DELETE /news/some-fake-uuid as admin
//      - Expect 404
// })
});
