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
exports.RateLimitService = void 0;
const cache_manager_1 = require("@nestjs/cache-manager");
const common_1 = require("@nestjs/common");
let RateLimitService = class RateLimitService {
    cacheManager;
    constructor(cacheManager) {
        this.cacheManager = cacheManager;
    }
    async checkLoginAttempt(email) {
        const key = `login_attempts:${email}`;
        const attempts = (await this.cacheManager.get(key)) || 0;
        if (attempts >= 5) {
            throw new common_1.BadRequestException('Too many login attempts. Try again in a few minutes.');
        }
        await this.cacheManager.set(key, attempts + 1, 300000);
    }
    async resetAttempts(email) {
        await this.cacheManager.del(`login_attempts:${email}`);
    }
    async checkForgotPasswordAttempt(email) {
        const key = `forgot_pass_attempts:${email}`;
        const attempts = (await this.cacheManager.get(key)) || 0;
        if (attempts >= 3) {
            throw new common_1.BadRequestException('Too many reset request. Try again later.');
        }
        await this.cacheManager.set(key, attempts + 1, 60000);
    }
};
exports.RateLimitService = RateLimitService;
exports.RateLimitService = RateLimitService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [Object])
], RateLimitService);
