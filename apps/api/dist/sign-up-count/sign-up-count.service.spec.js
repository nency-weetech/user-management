"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const sign_up_count_service_1 = require("./sign-up-count.service");
describe('SignUpCountService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [sign_up_count_service_1.SignUpCountService],
        }).compile();
        service = module.get(sign_up_count_service_1.SignUpCountService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=sign-up-count.service.spec.js.map