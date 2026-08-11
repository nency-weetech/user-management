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
exports.UserRepository = void 0;
const base_repository_1 = require("../common/base.repository");
const user_entity_1 = require("../entities/user.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const common_1 = require("@nestjs/common");
let UserRepository = class UserRepository extends base_repository_1.BaseAbstractRepostitory {
    userRepository;
    constructor(userRepository) {
        super(userRepository);
        this.userRepository = userRepository;
    }
    async findByEmail(email) {
        return this.userRepository.findOne({ where: { email } });
    }
    async findEmailWithPassword(email) {
        return this.userRepository
            .createQueryBuilder('user')
            .where('user.email = :email', { email })
            .addSelect('user.password')
            .getOne();
    }
    async findAllPaginated(page, limit, search, role, isActive) {
        const skip = (page - 1) * limit;
        const query = this.userRepository.createQueryBuilder('user');
        if (search) {
            query.andWhere('LOWER(user.email) LIKE LOWER(:search)', {
                search: `%${search}%`,
            });
        }
        if (role) {
            query.andWhere('user.role = :role', { role });
        }
        if (isActive !== undefined) {
            query.andWhere('user.isActive = :isActive', { isActive });
        }
        query
            .select([
            'user.id',
            'user.email',
            'user.role',
            'user.isActive',
            'user.isEmailVerified',
            'user.createdAt',
        ])
            .orderBy('user.createdAt', 'DESC')
            .skip(skip)
            .take(limit);
        return query.getManyAndCount();
    }
    async updateLastLogin(userId) {
        await this.userRepository.update(userId, { lastLoginAt: new Date() });
    }
    async updateName(id, firstName, lastName) {
        await this.userRepository.update(id, {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
        });
        return this.userRepository.findOneBy({ id });
    }
    async updateRefreshToken(userId, refreshToken) {
        await this.userRepository.update(userId, { refreshToken });
    }
    async markEmailAsValid(userId) {
        await this.userRepository.update(userId, {
            isEmailVerified: true,
            emailVerificationOtp: null,
            emailVerificationExpires: null,
        });
    }
    async saveOtp(userId, otpHash, expires) {
        await this.userRepository.update(userId, {
            passwordResetOtp: otpHash,
            resetOtpExpires: expires,
            otpAttempts: 0,
        });
    }
    async incrementOtpAttempt(userId) {
        await this.userRepository.increment({ id: userId }, 'otpAttempts', 1);
    }
    async clearOtp(userId) {
        await this.userRepository.update(userId, {
            passwordResetOtp: null,
            resetOtpExpires: null,
            otpAttempts: 0,
        });
    }
    async updatePasswordAndRevokeSession(userId, newPass) {
        await this.userRepository.update(userId, {
            password: newPass,
            passwordResetOtp: null,
            resetOtpExpires: null,
            otpAttempts: 0,
            refreshToken: null,
        });
    }
    async updateUserStatus(userId, isActive) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        user.isActive = isActive;
        if (!isActive) {
            user.refreshToken = null;
        }
        return this.userRepository.save(user);
    }
    async countSignupsSince(date) {
        return await this.userRepository.count({
            where: { createdAt: (0, typeorm_2.MoreThan)(date) },
        });
    }
    async getSignupUsersSince(date) {
        return await this.userRepository.find({
            where: { createdAt: (0, typeorm_2.MoreThan)(date) },
            select: { email: true, createdAt: true },
        });
    }
    async markPendingDeletion(userId) {
        await this.userRepository.update(userId, {
            isPendingDeletion: true,
            isActive: false,
            deletionRequestedAt: new Date(),
        });
    }
    async cancelPendingDeletion(userId) {
        await this.userRepository.update(userId, {
            isPendingDeletion: false,
            isActive: true,
            deletionRequestedAt: null,
        });
    }
    async findStaleDeletionRequests(cutoffDate) {
        return this.userRepository.find({
            where: {
                isPendingDeletion: true,
                deletionRequestedAt: (0, typeorm_2.LessThan)(cutoffDate),
            },
        });
    }
    async updateCreatedAtForTest(userId, date) {
        await this.userRepository.update(userId, { createdAt: date });
    }
};
exports.UserRepository = UserRepository;
exports.UserRepository = UserRepository = __decorate([
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserRepository);
