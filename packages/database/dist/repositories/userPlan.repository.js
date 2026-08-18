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
exports.UserPlanRepository = void 0;
const typeorm_1 = require("@nestjs/typeorm");
const base_repository_1 = require("../common/base.repository");
const userPlan_entity_1 = require("../entities/userPlan.entity");
const typeorm_2 = require("typeorm");
const user_plan_enum_1 = require("../enums/user-plan.enum");
let UserPlanRepository = class UserPlanRepository extends base_repository_1.BaseAbstractRepostitory {
    userPlanRepository;
    constructor(userPlanRepository) {
        super(userPlanRepository);
        this.userPlanRepository = userPlanRepository;
    }
    async createPlan(userId, plan) {
        const userPlan = this.userPlanRepository.create({
            userId: userId,
            plan,
            planUpgradedAt: null,
        });
        return this.userPlanRepository.save(userPlan);
    }
    findByUserId(userId) {
        return this.userPlanRepository.findOneBy({ userId: userId });
    }
    async upgradeToPaid(userId) {
        await this.userPlanRepository.update({ userId }, { plan: user_plan_enum_1.UserPlanEnum.PAID, planUpgradedAt: new Date() });
    }
};
exports.UserPlanRepository = UserPlanRepository;
exports.UserPlanRepository = UserPlanRepository = __decorate([
    __param(0, (0, typeorm_1.InjectRepository)(userPlan_entity_1.UserPlan)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserPlanRepository);
