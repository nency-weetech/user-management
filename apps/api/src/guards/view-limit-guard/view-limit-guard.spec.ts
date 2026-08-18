import { Test, TestingModule } from '@nestjs/testing';
import { ViewLimitGuard } from './view-limit-guard';
import { UserPlanRepository, UserUsageRepository } from '@myapp/database';

describe('ViewLimitGuard', () => {
  let guard: ViewLimitGuard;

  const mockUserPlanRepo = {
    findByUserId: jest.fn(),
  };

  const mockUserUsageRepo = {
    findByUserId: jest.fn(),
    resetDailyCount: jest.fn(),
    incrementViewCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ViewLimitGuard,
        { provide: UserPlanRepository, useValue: mockUserPlanRepo },
        { provide: UserUsageRepository, useValue: mockUserUsageRepo },
      ],
    }).compile();

    guard = module.get<ViewLimitGuard>(ViewLimitGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
});