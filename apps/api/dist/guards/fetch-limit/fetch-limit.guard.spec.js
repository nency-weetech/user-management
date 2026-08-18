"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const fetch_limit_guard_1 = require("./fetch-limit.guard");
const database_1 = require("@myapp/database");
const database_2 = require("@myapp/database"); // adjust to actual export name
describe('FetchLimitGuard', () => {
    let guard;
    const mockUserPlanRepo = {
        findByUserId: jest.fn(),
    };
    const mockNewsFetchLogRepo = {
        sumArticlesFetchedToday: jest.fn(),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                fetch_limit_guard_1.FetchLimitGuard,
                { provide: database_1.UserPlanRepository, useValue: mockUserPlanRepo },
                { provide: database_2.NewsFetchLogRepository, useValue: mockNewsFetchLogRepo },
            ],
        }).compile();
        guard = module.get(fetch_limit_guard_1.FetchLimitGuard);
    });
    it('should be defined', () => {
        expect(guard).toBeDefined();
    });
});
//# sourceMappingURL=fetch-limit.guard.spec.js.map