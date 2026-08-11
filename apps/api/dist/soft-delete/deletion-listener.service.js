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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeletionListenerService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = __importDefault(require("ioredis"));
const users_service_1 = require("../users/users.service");
let DeletionListenerService = class DeletionListenerService {
    userService;
    subsriber;
    constructor(userService) {
        this.userService = userService;
        this.subsriber = new ioredis_1.default({ host: 'localhost', port: 6379 });
    }
    onModuleInit() {
        this.subsriber.subscribe('__keyevent@0__:expired');
        this.subsriber.on('message', async (channel, expiredKey) => {
            if (expiredKey.startsWith('pending_deletion:')) {
                const userId = expiredKey.replace('pending_deletion:', '');
                console.log(`Grace period expired for user ${userId} — deleting permanently`);
                await this.userService.permanentDelete(userId);
            }
        });
    }
};
exports.DeletionListenerService = DeletionListenerService;
exports.DeletionListenerService = DeletionListenerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], DeletionListenerService);
