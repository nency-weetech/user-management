"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const database_1 = require("@myapp/database");
const users_module_1 = require("./users/users.module");
const auth_module_1 = require("./auth/auth.module");
const jwt_1 = require("@nestjs/jwt");
const mail_module_1 = require("./mail/mail.module");
const cache_manager_1 = require("@nestjs/cache-manager");
const redis_1 = require("@keyv/redis");
const rate_limit_service_1 = require("./rate-limit/rate-limit.service");
const rate_limit_module_1 = require("./rate-limit/rate-limit.module");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const activity_log_module_1 = require("./activity-log/activity-log.module");
const redis_module_1 = require("./redis/redis.module");
const sign_up_count_service_1 = require("./sign-up-count/sign-up-count.service");
const schedule_1 = require("@nestjs/schedule");
const soft_delete_service_1 = require("./soft-delete/soft-delete.service");
const deletion_listener_service_1 = require("./soft-delete/deletion-listener.service");
const deletion_cleanup_service_1 = require("./soft-delete/deletion-cleanup.service");
const soft_delete_module_1 = require("./soft-delete/soft-delete.module");
const news_module_1 = require("./news/news.module");
const nestjs_1 = require("@bull-board/nestjs");
const express_1 = require("@bull-board/express");
const disableThrottler = process.env.NODE_ENV === 'test' && process.env.DISABLE_THROTTLER !== 'false';
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '../../.env'
            }),
            nestjs_1.BullBoardModule.forRoot({
                route: '/queues',
                adapter: express_1.ExpressAdapter
            }),
            schedule_1.ScheduleModule.forRoot(),
            cache_manager_1.CacheModule.registerAsync({
                isGlobal: true,
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: async (config) => ({
                    stores: [
                        (0, redis_1.createKeyv)(`redis://${config.get('REDIS_HOST')}:${config.get('REDIS_PORT')}/${config.get('REDIS_DB') || 0}`),
                    ],
                    ttl: 60 * 1000,
                }),
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 15,
                },
            ]),
            typeorm_1.TypeOrmModule.forRoot(database_1.datasourceOptions),
            jwt_1.JwtModule.register({
                global: true,
                secret: process.env.ACCESS_JWT_SECRET,
                signOptions: {
                    expiresIn: '1h',
                },
            }),
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            redis_module_1.RedisModule,
            mail_module_1.MailModule,
            rate_limit_module_1.RateLimitModule,
            activity_log_module_1.ActivityLogModule,
            soft_delete_module_1.SoftDeleteModule,
            news_module_1.NewsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            rate_limit_service_1.RateLimitService,
            // ...(process.env.NODE_ENV !== 'test'
            // ? [{ provide: APP_GUARD, useClass: ThrottlerGuard }]
            // : []),
            // { provide: APP_GUARD, useClass: ThrottlerGuard },
            ...(!disableThrottler
                ? [{ provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard }]
                : []),
            sign_up_count_service_1.SignUpCountService,
            soft_delete_service_1.SoftDeleteService,
            deletion_listener_service_1.DeletionListenerService,
            deletion_cleanup_service_1.DeletionCleanupService,
        ],
    })
], AppModule);
