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
exports.OrganizationPlanRepository = void 0;
const typeorm_1 = require("@nestjs/typeorm");
const base_repository_1 = require("../common/base.repository");
const organization_plan_entity_1 = require("../entities/organization.plan.entity");
const typeorm_2 = require("typeorm");
let OrganizationPlanRepository = class OrganizationPlanRepository extends base_repository_1.BaseAbstractRepostitory {
    orgPlanRepo;
    constructor(orgPlanRepo) {
        super(orgPlanRepo);
        this.orgPlanRepo = orgPlanRepo;
    }
    async createOrgPlan(organizationId, plan) {
        const orgPlan = this.orgPlanRepo.create({
            organization: { id: organizationId },
            plan
        });
        return this.orgPlanRepo.save(orgPlan);
    }
    async findByOrgId(organizationId) {
        return this.orgPlanRepo.findOne({ where: { organization_id: organizationId } });
    }
    async upgradeToPlan(organizationId, plan) {
        await this.orgPlanRepo.update({ organization_id: organizationId }, { plan, plan_upgraded_at: new Date() });
    }
};
exports.OrganizationPlanRepository = OrganizationPlanRepository;
exports.OrganizationPlanRepository = OrganizationPlanRepository = __decorate([
    __param(0, (0, typeorm_1.InjectRepository)(organization_plan_entity_1.OrganizationPlan)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], OrganizationPlanRepository);
