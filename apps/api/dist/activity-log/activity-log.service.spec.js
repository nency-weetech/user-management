"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const activity_log_service_1 = require("./activity-log.service");
describe('ActivityLogService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [activity_log_service_1.ActivityLogService],
        }).compile();
        service = module.get(activity_log_service_1.ActivityLogService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=activity-log.service.spec.js.map