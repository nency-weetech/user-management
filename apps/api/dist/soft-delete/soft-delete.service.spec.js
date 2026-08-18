"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const soft_delete_service_1 = require("./soft-delete.service");
describe('SoftDeleteService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [soft_delete_service_1.SoftDeleteService],
        }).compile();
        service = module.get(soft_delete_service_1.SoftDeleteService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=soft-delete.service.spec.js.map