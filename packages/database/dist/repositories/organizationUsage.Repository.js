"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationUsageRepository = void 0;
const typeorm_1 = require("@nestjs/typeorm");
const base_repository_1 = require("../common/base.repository");
const organizationUsage_entity_1 = require("../entities/organizationUsage.entity");
const typeorm_2 = require("typeorm");
let OrganizationUsageRepository = class OrganizationUsageRepository extends base_repository_1.BaseAbstractRepostitory {
    orgUsageRepo;
    constructor(orgUsageRepo) {
        super(orgUsageRepo);
        this.orgUsageRepo = orgUsageRepo;
    }
    async createOrgUsage(organizationId) {
        const orgUsage = this.orgUsageRepo.create({
            organization: { id: organizationId },
            daily_bookmark_count: 0,
            daily_bookmark_reset_at: null,
        });
        return this.orgUsageRepo.save(orgUsage);
    }
    async findByOrgId(organizationId) {
        return this.orgUsageRepo.findOne({
            where: { organization_id: organizationId },
        });
    }
    async incrementBookmarkCount(organizationId, by) {
        await this.orgUsageRepo.increment({ organization_id: organizationId }, 'daily_bookmark_count', by);
    }
    async resetDailyBookmarkCount(organizationId, resetDate) {
        await this.orgUsageRepo.update({ organization_id: organizationId }, { daily_bookmark_count: 0, daily_bookmark_reset_at: resetDate });
    }
};
exports.OrganizationUsageRepository = OrganizationUsageRepository;
exports.OrganizationUsageRepository = OrganizationUsageRepository = __decorate([
    __param(0, (0, typeorm_1.InjectRepository)(organizationUsage_entity_1.OrganizationUsage)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], OrganizationUsageRepository);
