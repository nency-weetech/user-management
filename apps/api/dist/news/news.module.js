"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsModule = void 0;
const common_1 = require("@nestjs/common");
const news_service_1 = require("./news.service");
const news_controller_1 = require("./news.controller");
const typeorm_1 = require("@nestjs/typeorm");
const database_1 = require("@myapp/database");
const database_2 = require("@myapp/database");
const axios_1 = require("@nestjs/axios");
const database_3 = require("@myapp/database");
const database_4 = require("@myapp/database");
const bullmq_1 = require("@nestjs/bullmq");
const nestjs_1 = require("@bull-board/nestjs");
const bullMQAdapter_1 = require("@bull-board/api/bullMQAdapter");
const news_queue_service_1 = require("./news.queue.service");
let NewsModule = class NewsModule {
};
exports.NewsModule = NewsModule;
exports.NewsModule = NewsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([database_1.Article, database_3.NewsFetchLog]),
            axios_1.HttpModule,
            bullmq_1.BullModule.registerQueue({
                name: 'newsQueue',
            }),
            nestjs_1.BullBoardModule.forFeature({
                name: 'newsQueue',
                adapter: bullMQAdapter_1.BullMQAdapter,
            }),
        ],
        controllers: [news_controller_1.NewsController],
        providers: [
            database_2.ArticleRepository,
            database_4.NewsFetchLogRepository,
            news_queue_service_1.NewsQueueService,
            news_service_1.NewsService,
        ],
        exports: [news_queue_service_1.NewsQueueService]
    })
], NewsModule);
