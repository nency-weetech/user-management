"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerModule = void 0;
// worker.module.ts
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const news_fetcher_service_1 = require("./news/news-fetcher.service");
const database_1 = require("@myapp/database");
const database_2 = require("@myapp/database");
const mail_processor_1 = require("./mail/mail.processor");
const redis_module_1 = require("./redis/redis.module");
const axios_1 = require("@nestjs/axios");
const news_fetcher_processor_1 = require("./news/news.fetcher.processor");
const config_1 = require("@nestjs/config");
const database_3 = require("@myapp/database");
const typeorm_1 = require("@nestjs/typeorm");
const api_1 = require("@myapp/api");
const news_service_1 = require("@myapp/api/src/news/news.service");
const news_refresh_cron_1 = require("./news/news-refresh.cron");
const database_4 = require("@myapp/database");
const database_5 = require("@myapp/database");
const shared_1 = require("@myapp/shared");
let WorkerModule = class WorkerModule {
};
exports.WorkerModule = WorkerModule;
exports.WorkerModule = WorkerModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            shared_1.LoggerModule,
            typeorm_1.TypeOrmModule.forRoot(database_3.datasourceOptions),
            typeorm_1.TypeOrmModule.forFeature([database_5.Article, database_4.NewsFetchLog, database_1.User]),
            redis_module_1.RedisModule,
            axios_1.HttpModule,
            bullmq_1.BullModule.registerQueue({ name: 'newsQueue' }, { name: 'mailQueue' }),
        ],
        providers: [
            mail_processor_1.MailProcessor,
            database_1.ArticleRepository,
            database_2.NewsFetchLogRepository,
            news_fetcher_service_1.NewsFetcherService,
            api_1.NewsQueueService,
            news_fetcher_processor_1.NewsProcessor,
            news_service_1.NewsService,
            news_refresh_cron_1.NewsRefreshCorn,
        ],
    })
], WorkerModule);
