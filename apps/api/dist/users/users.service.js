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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@myapp/database");
const database_2 = require("@myapp/database");
const cache_manager_1 = require("@nestjs/cache-manager");
const activity_log_service_1 = require("../activity-log/activity-log.service");
const database_3 = require("@myapp/database");
let UsersService = class UsersService {
    repo;
    userPlanRepo;
    userUsageRepo;
    activityLogService;
    cacheManager;
    constructor(repo, userPlanRepo, userUsageRepo, activityLogService, cacheManager) {
        this.repo = repo;
        this.userPlanRepo = userPlanRepo;
        this.userUsageRepo = userUsageRepo;
        this.activityLogService = activityLogService;
        this.cacheManager = cacheManager;
    }
    userCacheKey(id) {
        return `user:${id}`;
    }
    async create(userData) {
        const user = this.repo.create(userData);
        await this.repo.save(user);
        await this.userPlanRepo.createPlan(user.id, database_1.UserPlanEnum.FREE);
        await this.userUsageRepo.createUsage(user.id);
        return user;
    }
    async findAllPaginated(queryDto) {
        const { page, limit, search, role, isActive } = queryDto;
        const [items, totalItems] = await this.repo.findAllPaginated(page, limit, search, role, isActive);
        const totalPage = Math.ceil(totalItems / limit);
        return {
            data: items,
            meta: {
                totalItems,
                itemsCount: items.length,
                itemsPerPage: limit,
                totalPage,
                currentPage: page,
                hasNextPage: page < totalPage,
                hasPreviousPage: page > 1,
            },
        };
    }
    async findOne(id) {
        const cacheKey = await this.userCacheKey(id);
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const user = await this.repo.findOneById(id);
        if (!user) {
            throw new common_1.NotFoundException(`User with id ${id} not found`);
        }
        await this.cacheManager.set(cacheKey, user, 300000);
        return user;
    }
    async findByEmail(email) {
        return await this.repo.findByEmail(email);
    }
    async findEmailWithPassword(email) {
        return this.repo.findEmailWithPassword(email);
    }
    async updateLastLogin(userId) {
        await this.repo.updateLastLogin(userId);
    }
    async update(id, updateUserDto, currentUser) {
        const user = await this.repo.findOneById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const isAdmin = currentUser.role === database_2.UserRole.ADMIN;
        const isSelf = currentUser.id === id;
        if (!isAdmin && !isSelf) {
            throw new common_1.ForbiddenException('You can update only your own profile');
        }
        if (updateUserDto.role && !isAdmin) {
            throw new common_1.ForbiddenException('Only admins can change user roles');
        }
        const updatedUser = await this.repo.updateName(id, updateUserDto.firstName, updateUserDto.lastName);
        await this.cacheManager.del(this.userCacheKey(id));
        await this.activityLogService.logActivity(user.id, 'UPDATE_PROFILE');
        return updatedUser;
    }
    async updateRefreshToken(userId, refreshTokenparams) {
        const user = await this.repo.findOneById(userId);
        if (!user) {
            throw new common_1.NotFoundException(`User with ID "${userId}" not found`);
        }
        return this.repo.updateRefreshToken(userId, refreshTokenparams ?? null);
    }
    async markEmailAsValid(userId) {
        await this.repo.markEmailAsValid(userId);
    }
    async saveOtp(userId, otpHash, expires) {
        await this.repo.saveOtp(userId, otpHash, expires);
    }
    async incrementOtpAttemp(userId) {
        await this.repo.incrementOtpAttempt(userId);
    }
    async clearOtp(userId) {
        await this.repo.clearOtp(userId);
    }
    async updatePasswordAndRevokeSession(userId, newPass) {
        await this.repo.updatePasswordAndRevokeSession(userId, newPass);
    }
    async updateUserStatus(userId, dto) {
        const user = await this.repo.findOneById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async countSignupUser(date) {
        return await this.repo.countSignupsSince(date);
    }
    async getSignupUsersSince(date) {
        return await this.repo.getSignupUsersSince(date);
    }
    async markPendingDeletion(userId) {
        await this.repo.markPendingDeletion(userId);
        await this.cacheManager.del(this.userCacheKey(userId));
        await this.activityLogService.logActivity(userId, 'DELETE_REQUEST');
    }
    async cancelPandingDeletion(userId) {
        (await this.repo.cancelPendingDeletion(userId),
            await this.cacheManager.del(this.userCacheKey(userId)));
    }
    async permanentDelete(userId) {
        const user = await this.repo.findOneById(userId);
        if (user) {
            await this.repo.remove(user);
        }
        await this.cacheManager.del(this.userCacheKey(userId));
    }
    async findStaleDeletionRequests(cutoffDate) {
        return this.repo.findStaleDeletionRequests(cutoffDate);
    }
    async updateCreatedAtForTest(userId, date) {
        await this.repo.updateCreatedAtForTest(userId, date);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [database_3.UserRepository,
        database_1.UserPlanRepository,
        database_1.UserUsageRepository,
        activity_log_service_1.ActivityLogService, Object])
], UsersService);
//# sourceMappingURL=users.service.js.map