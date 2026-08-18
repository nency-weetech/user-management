"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const view_limit_guard_1 = require("./view-limit-guard");
const database_1 = require("@myapp/database");
describe('ViewLimitGuard', () => {
    let guard;
    const mockUserPlanRepo = {
        findByUserId: jest.fn(),
    };
    const mockUserUsageRepo = {
        findByUserId: jest.fn(),
        resetDailyCount: jest.fn(),
        incrementViewCount: jest.fn(),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                view_limit_guard_1.ViewLimitGuard,
                { provide: database_1.UserPlanRepository, useValue: mockUserPlanRepo },
                { provide: database_1.UserUsageRepository, useValue: mockUserUsageRepo },
            ],
        }).compile();
        guard = module.get(view_limit_guard_1.ViewLimitGuard);
    });
    it('should be defined', () => {
        expect(guard).toBeDefined();
    });
});
//# sourceMappingURL=view-limit-guard.spec.js.map