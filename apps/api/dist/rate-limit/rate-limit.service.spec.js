"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const rate_limit_service_1 = require("./rate-limit.service");
describe('RateLimitService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [rate_limit_service_1.RateLimitService],
        }).compile();
        service = module.get(rate_limit_service_1.RateLimitService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
