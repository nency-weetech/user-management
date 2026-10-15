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
var NewsProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const news_fetcher_service_1 = require("./news-fetcher.service");
let NewsProcessor = NewsProcessor_1 = class NewsProcessor extends bullmq_1.WorkerHost {
    newsFetcherService;
    logger = new common_1.Logger(NewsProcessor_1.name);
    constructor(newsFetcherService) {
        super();
        this.newsFetcherService = newsFetcherService;
    }
    async process(job) {
        this.logger.log(`Processing news job: ${job.name}`);
        switch (job.name) {
            case 'fetch-news':
                return this.handlenewsFetch(job);
            default:
                this.logger.warn(`Unknown job type: ${job.name}`);
        }
    }
    async handlenewsFetch(job) {
        const { query, number, triggeredByUserId } = job.data;
        const result = await this.newsFetcherService.fetchAndStoreNews(query, number, triggeredByUserId);
        this.logger.log(`News fetched: ${result.fetched} articles for "${query}"`);
        return result;
    }
};
exports.NewsProcessor = NewsProcessor;
exports.NewsProcessor = NewsProcessor = NewsProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('newsQueue', {
        concurrency: 3,
        limiter: {
            max: 6,
            duration: 10000,
        },
    }),
    __metadata("design:paramtypes", [news_fetcher_service_1.NewsFetcherService])
], NewsProcessor);
