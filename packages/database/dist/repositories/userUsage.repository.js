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
exports.UserUsageRepository = void 0;
const typeorm_1 = require("@nestjs/typeorm");
const base_repository_1 = require("../common/base.repository");
const userUsage_entity_1 = require("../entities/userUsage.entity");
const typeorm_2 = require("typeorm");
let UserUsageRepository = class UserUsageRepository extends base_repository_1.BaseAbstractRepostitory {
    userUsageRepository;
    constructor(userUsageRepository) {
        super(userUsageRepository);
        this.userUsageRepository = userUsageRepository;
    }
    createUsage(userId) {
        const userUsage = this.userUsageRepository.create({
            userId: userId,
            dailyArticleViewCount: 0,
            dailyArticleViewResetAt: null,
        });
        return this.userUsageRepository.save(userUsage);
    }
    findByUserId(userId) {
        return this.userUsageRepository.findOneBy({ userId: userId });
    }
    async incrementViewCount(userId, by) {
        await this.userUsageRepository.increment({ userId }, 'dailyArticleViewCount', by);
    }
    async resetDailyCount(userId, resetDate) {
        await this.userUsageRepository.update({ userId }, {
            dailyArticleViewCount: 0,
            dailyArticleViewResetAt: resetDate,
        });
    }
};
exports.UserUsageRepository = UserUsageRepository;
exports.UserUsageRepository = UserUsageRepository = __decorate([
    __param(0, (0, typeorm_1.InjectRepository)(userUsage_entity_1.UserUsage)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserUsageRepository);
