import { Test, TestingModule } from '@nestjs/testing';
import { FetchLimitGuard } from './fetch-limit.guard';
import { UserPlanRepository } from '@myapp/database';
import { NewsFetchLogRepository } from '@myapp/database'; // adjust to actual export name

describe('FetchLimitGuard', () => {
  let guard: FetchLimitGuard;

  const mockUserPlanRepo = {
    findByUserId: jest.fn(),
  };

  const mockNewsFetchLogRepo = {
    sumArticlesFetchedToday: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FetchLimitGuard,
        { provide: UserPlanRepository, useValue: mockUserPlanRepo },
        { provide: NewsFetchLogRepository, useValue: mockNewsFetchLogRepo },
      ],
    }).compile();

    guard = module.get<FetchLimitGuard>(FetchLimitGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
});