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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewLimitGuard = void 0;
const database_1 = require("@myapp/database");
const common_1 = require("@nestjs/common");
let ViewLimitGuard = class ViewLimitGuard {
    userPlanRepo;
    userUsageRepo;
    constructor(userPlanRepo, userUsageRepo) {
        this.userPlanRepo = userPlanRepo;
        this.userUsageRepo = userUsageRepo;
    }
    async canActivate(context) {
        const { user } = context.switchToHttp().getRequest();
        if (!user) {
            throw new common_1.NotFoundException('User Not exists');
        }
        const userPlan = await this.userPlanRepo.findByUserId(user.id);
        if (!userPlan) {
            throw new common_1.NotFoundException('User plan not found');
        }
        if (userPlan.plan === database_1.UserPlanEnum.PAID) {
            return true;
        }
        const userUsage = await this.userUsageRepo.findByUserId(user.id);
        if (!userUsage) {
            throw new common_1.NotFoundException('User usage not found');
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const resetAt = userUsage.dailyArticleViewResetAt
            ? new Date(userUsage.dailyArticleViewResetAt)
            : null;
        const sameDay = resetAt !== null &&
            resetAt.getFullYear() === today.getFullYear() &&
            resetAt.getMonth() === today.getMonth() &&
            resetAt.getDate() === today.getDate();
        let currentCount;
        if (!sameDay) {
            await this.userUsageRepo.resetDailyCount(user.id, today);
            currentCount = 0;
        }
        else {
            currentCount = userUsage.dailyArticleViewCount;
        }
        if (currentCount >= 20) {
            throw new common_1.ForbiddenException('Daily View limit Reached, Upgrad to pro for unlimited access.');
        }
        // await this.userUsageRepo.incrementViewCount(user.id, 1);
        return true;
    }
};
exports.ViewLimitGuard = ViewLimitGuard;
exports.ViewLimitGuard = ViewLimitGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.UserPlanRepository,
        database_1.UserUsageRepository])
], ViewLimitGuard);
//# sourceMappingURL=view-limit-guard.guard.js.map