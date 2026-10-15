"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisModule = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
let RedisModule = class RedisModule {
};
exports.RedisModule = RedisModule;
exports.RedisModule = RedisModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            bullmq_1.BullModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (config) => ({
                    connection: {
                        host: config.get('REDIS_HOST'),
                        port: config.get('REDIS_PORT'),
                        db: config.get('REDIS_DB') || 0,
                    }
                }),
                inject: [config_1.ConfigService]
            }),
        ],
        providers: [
            {
                provide: 'REDIS_CLIENT',
                useFactory: (config) => {
                    return new ioredis_1.default({
                        host: config.get('REDIS_HOST'),
                        port: config.get('REDIS_PORT'),
                        db: config.get('REDIS_DB') || 0,
                    });
                },
                inject: [config_1.ConfigService],
            },
        ],
        exports: ['REDIS_CLIENT', bullmq_1.BullModule],
    })
], RedisModule);
