import { INestApplication } from '@nestjs/common';
import { closeTestApp, newslog, setUpApp } from './utils/setup-app';
import { NewsService } from 'src/news/news.service';
import Redis from 'ioredis';
import { cleanDatabase } from './utils/db-cleanup';
import Request from 'supertest';
import { UsersService } from 'src/users/users.service';
import { UserRole } from 'src/users/enums/user-role.enum';
import bcrypt from 'bcrypt';
import { ArticleRepository } from 'src/news/article.repository';
import { NewsFetchLogRepository } from 'src/news/news-fetch-log.repository';
import { of, throwError } from 'rxjs';
import { fetchTrigger } from 'src/news/entities/news-fetch-log.entity';
import { title } from 'process';

describe('News (e2e)', () => {
  let app: INestApplication;
  let newsService: NewsService;
  let usersService: UsersService;
  let userToken: string;
  let articleRepository: ArticleRepository;
  let newsFetchLogRepository: NewsFetchLogRepository;

  beforeAll(async () => {
    app = await setUpApp();
    newsService = app.get<NewsService>(NewsService);
    usersService = app.get<UsersService>(UsersService);
    articleRepository = app.get<ArticleRepository>(ArticleRepository);
    newsFetchLogRepository = app.get<NewsFetchLogRepository>(
      NewsFetchLogRepository,
    );
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
    it('should return 403 for regular user', async () => {
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
        .expect(403);
    });
    it('should return 401 for unauthenticated request', async () => {
      await Request(app.getHttpServer())
        .post('/news/refresh')
        .send({ query: 'technology', number: 3 })
        .expect(401);
    });
    it('should allow admin to trigger a refresh', async () => {
      newslog.mockHttpGet.mockReturnValue(
        of({
          data: {
            news: [
              {
                id: 9999,
                title: 'Test Article',
                summary: 'Mocked Article',
                url: 'https://test.com',
                publish_date: '2026-01-01 00:00:00',
              },
            ],
          },
        }),
      );

      const admin = await createVerifiedAdmin('admin@test.com');
      const logres = await Request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@test.com', password: 'password@123' })
        .expect(201);

      const { accessToken, refreshToken } = logres.body;

      const res = await Request(app.getHttpServer())
        .post('/news/refresh')
        .set('Cookie', [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .send({ query: 'business' })
        .expect(201);

      const articles = await articleRepository.findAll();
      expect(articles.length).toBe(1);
      expect(articles[0].summary).toBe('Mocked Article');

      const log = await newsFetchLogRepository.findRecent(1);
      expect(log[0].success).toBe(true);
      expect(log[0].triggeredByUserId).toBe(admin.id);
    });
    it('should log a failure if the external API call fails', async () => {
      newslog.mockHttpGet.mockReturnValue(
        throwError(() => new Error('Request Failed with status code 401')),
      );

      await createVerifiedAdmin('admin@test.com');
      const logres = await Request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@test.com', password: 'password@123' })
        .expect(201);

      const { accessToken, refreshToken } = logres.body;

      const res = await Request(app.getHttpServer())
        .post('/news/refresh')
        .set('Cookie', [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .send({ query: 'business' });

      expect(res.status).toBe(500);

      const log = await newsFetchLogRepository.findRecent(1);

      expect(log[0].success).toBe(false);
      expect(log[0].errorMessage).toContain('401');
      expect(log[0].triggeredBy).toBe('admin');
      expect(log[0].articlesFetched).toBe(0);
    });
  });

  describe('GET /news/fetch-history', () => {
    it('should return fetch logs for admin', async () => {
      const admin = await createVerifiedAdmin('admin@test.com');
      await newsFetchLogRepository.createAndSave({
        query: 'technology',
        articlesFetched: 5,
        triggeredBy: fetchTrigger.ADMIN,
        triggeredByUserId: admin.id,
        success: true,
        errorMessage: null,
        durationMs: 500,
      });
      await newsFetchLogRepository.createAndSave({
        query: 'Politics',
        articlesFetched: 0,
        triggeredBy: fetchTrigger.CORN,
        triggeredByUserId: null,
        success: false,
        errorMessage: 'Rate limited',
        durationMs: 200,
      });

      const logRes = await Request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@test.com', password: 'password@123' })
        .expect(201);

      const { accessToken, refreshToken } = logRes.body;

      const res = await Request(app.getHttpServer())
        .get('/news/fetch-history')
        .query({ limit: 2 })
        .set('Cookie', [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .expect(200);

      expect(res.body.length).toBe(2);
    });
    it('should return 403 for regular user', async () => {
      await createVerifiedUser('user@test.com');

      const logRes = await Request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@test.com', password: 'password@123' });

      const { accessToken, refreshToken } = logRes.body;

      const res = await Request(app.getHttpServer())
        .get('/news/fetch-history')
        .query({ limit: 2 })
        .set('Cookie', [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ]);

      expect(res.status).toBe(403);
    });
    it('should respect the limit query param', async () => {
      const admin = await createVerifiedAdmin('admin@test.com');
      const query = [
        'technology',
        'politics',
        'business',
        'technology',
        'sports',
      ];

      for (let i = 0; i < 5; i++) {
        await newsFetchLogRepository.createAndSave({
          query: query[i],
          articlesFetched: i,
          triggeredBy: fetchTrigger.ADMIN,
          triggeredByUserId: admin.id,
          success: true,
          errorMessage: null,
          durationMs: 200,
        });
      }

      const logRes = await Request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@test.com', password: 'password@123' })
        .expect(201);

      const { accessToken, refreshToken } = logRes.body;

      const res = await Request(app.getHttpServer())
        .get('/news/fetch-history')
        .query({ limit: 2 })
        .set('Cookie', [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .expect(200);

      expect(res.body.length).toBe(2);
      const logs = await newsFetchLogRepository.findAll();
      expect(logs.length).toBe(5);
    });
  });

  describe('DELETE /news/:id', () => {
    it('should allow admin to delete an article', async () => {
      const article = await articleRepository.upsertArticle({
        externalId: 12345,
        summary: `A test summary `,
        url: `https://example.com/test`,
        catagory: 'technology',
        sourceCountry: 'us',
        sentiment: 0.5,
        publishDated: new Date(),
        lastRefreshedAt: new Date(),
      });

      const id = article.id;
      const admin = await createVerifiedAdmin('admin@test.com');
      const logRes = await Request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@test.com', password: 'password@123' });

      const { accessToken, refreshToken } = logRes.body;

      const res = await Request(app.getHttpServer())
        .delete(`/news/${id}`)
        .set('Cookie', [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .expect(200);
      const deletedArticle = await articleRepository.findByExternalId(12345);
      expect(deletedArticle).toBeNull();
    });
    it('should return 403 for regular user', async () => {
      const id = '0000000-000-0000-0000';
      await createVerifiedUser('user@test.com');
      const logRes = await Request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@test.com', password: 'password@123' });

      const { accessToken, refreshToken } = logRes.body;

      await Request(app.getHttpServer())
        .delete(`/news/${id}`)
        .set('Cookie', [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .expect(403);
    });
    it('should return 404 for nonexistent article', async () => {
      const id = '00000000-0000-0000-0000-000000000000';
      await createVerifiedAdmin('admin@test.com');
      const logRes = await Request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@test.com', password: 'password@123' });

      const { accessToken, refreshToken } = logRes.body;

      await Request(app.getHttpServer())
        .delete(`/news/${id}`)
        .set('Cookie', [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .expect(404);
    });
  });

  describe('PATCH /news/:id', () => {
    it('should allow admin to update an article', async () => {
      const article = await articleRepository.upsertArticle({
        externalId: 12345,
        summary: `A test summary `,
        url: `https://example.com/test`,
        catagory: 'technology',
        sourceCountry: 'us',
        sentiment: 0.5,
        publishDated: new Date(),
        lastRefreshedAt: new Date(),
      });

      const id = article.id;
      const admin = await createVerifiedAdmin('admin@test.com');
      const logRes = await Request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@test.com', password: 'password@123' });

      const { accessToken, refreshToken } = logRes.body;

      const res = await Request(app.getHttpServer())
        .patch(`/news/${id}`)
        .set('Cookie', [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .send({ title: 'Updated Title', catagory: 'politics' })
        .expect(200);

      const updateArticle = await articleRepository.findOneById(id);
      expect(updateArticle?.title).toBe('Updated Title');
      expect(updateArticle?.catagory).toBe('politics');
    });
    it('should return 403 for regular user', async () => {
      const article = await articleRepository.upsertArticle({
        externalId: 12345,
        summary: `A test summary `,
        url: `https://example.com/test`,
        catagory: 'technology',
        sourceCountry: 'us',
        sentiment: 0.5,
        publishDated: new Date(),
        lastRefreshedAt: new Date(),
      });

      const id = article.id;
      const user = await createVerifiedUser('user@test.com');
      const logRes = await Request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@test.com', password: 'password@123' });

      const { accessToken, refreshToken } = logRes.body;

      const res = await Request(app.getHttpServer())
        .patch(`/news/${id}`)
        .set('Cookie', [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .send({ title: 'Updated Title', catagory: 'politics' })
        .expect(403);

      const updateArticle = await articleRepository.findOneById(id);
      expect(updateArticle?.title).not.toBe('Updated Title');
      expect(updateArticle?.catagory).not.toBe('politics');
    });
    it('should return 401 for unauthenticated request', async () => {
      const article = await articleRepository.upsertArticle({
        externalId: 12345,
        summary: `A test summary `,
        url: `https://example.com/test`,
        catagory: 'technology',
        sourceCountry: 'us',
        sentiment: 0.5,
        publishDated: new Date(),
        lastRefreshedAt: new Date(),
      });
      const id = article.id;
      const res = await Request(app.getHttpServer())
        .patch(`/news/${id}`)
        .send({ title: 'updated title' })
        .expect(401);
    });
    it('should return 404 for nonexistent article', async () => {
      const id = '00000000-0000-0000-0000-000000000000';
      await createVerifiedAdmin('admin@test.com');
      const logRes = await Request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@test.com', password: 'password@123' });

      const { accessToken, refreshToken } = logRes.body;

      await Request(app.getHttpServer())
        .delete(`/news/${id}`)
        .set('Cookie', [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .send({ title: 'Not found article' })
        .expect(404);
    });
    it('should only update the fields provided, leaving others unchanged', async () => {
      const article = await articleRepository.upsertArticle({
        externalId: 12345,
        title: 'original',
        summary: `the original article`,
        url: `https://example.com/test`,
        catagory: 'technology',
        sourceCountry: 'us',
        sentiment: 0.5,
        publishDated: new Date(),
        lastRefreshedAt: new Date(),
      });

      const id = article.id;
      const admin = await createVerifiedAdmin('admin@test.com');
      const logRes = await Request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@test.com', password: 'password@123' });

      const { accessToken, refreshToken } = logRes.body;

      const res = await Request(app.getHttpServer())
        .patch(`/news/${id}`)
        .set('Cookie', [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .send({ catagory: 'politics' })
        .expect(200);

      const updateArticle = await articleRepository.findOneById(id);
      expect(updateArticle?.title).toBe('original');
      expect(updateArticle?.catagory).toBe('politics');
    });
    it('should reject invalid data (e.g., wrong type for a field)', async () => {
      const article = await articleRepository.upsertArticle({
        externalId: 12345,
        title: 'original',
        summary: `the original article`,
        url: `https://example.com/test`,
        catagory: 'technology',
        sourceCountry: 'us',
        sentiment: 0.5,
        publishDated: new Date(),
        lastRefreshedAt: new Date(),
      });

      const id = article.id;
      const admin = await createVerifiedAdmin('admin@test.com');
      const logRes = await Request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@test.com', password: 'password@123' });

      const { accessToken, refreshToken } = logRes.body;

      const res = await Request(app.getHttpServer())
        .patch(`/news/${id}`)
        .set('Cookie', [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .send({ catagory: 123 })
        .expect(400);

    });
  });
});

