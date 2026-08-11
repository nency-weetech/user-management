"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const weekly_report_service_1 = require("./weekly-report.service");
describe('WeeklyReportService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [weekly_report_service_1.WeeklyReportService],
        }).compile();
        service = module.get(weekly_report_service_1.WeeklyReportService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
