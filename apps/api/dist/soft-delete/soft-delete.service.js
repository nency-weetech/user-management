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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoftDeleteService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = __importDefault(require("ioredis"));
const users_service_1 = require("../users/users.service");
let SoftDeleteService = class SoftDeleteService {
    redis;
    userService;
    constructor(redis, userService) {
        this.redis = redis;
        this.userService = userService;
    }
    GRACE_PERIOD_SECOND = 30; //its 30 sec.. --> 30 * 24 * 60 * 60 --> 30 days
    key(userId) {
        return `pending_deletion:${userId}`;
    }
    async requestDeletion(userId) {
        await this.redis.set(this.key(userId), "1", "EX", this.GRACE_PERIOD_SECOND);
        await this.userService.markPendingDeletion(userId);
    }
    async isPendingDeletion(userId) {
        const result = await this.redis.get(this.key(userId));
        return result !== null;
    }
    async cancelDeletion(userId) {
        await this.redis.del(this.key(userId));
        await this.userService.cancelPandingDeletion(userId);
    }
};
exports.SoftDeleteService = SoftDeleteService;
exports.SoftDeleteService = SoftDeleteService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('REDIS_CLIENT')),
    __metadata("design:paramtypes", [ioredis_1.default,
        users_service_1.UsersService])
], SoftDeleteService);
