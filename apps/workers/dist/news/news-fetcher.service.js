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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsFetcherService = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const database_1 = require("@myapp/database");
const rxjs_1 = require("rxjs");
const database_2 = require("@myapp/database");
const database_3 = require("@myapp/database");
let NewsFetcherService = class NewsFetcherService {
    httpService;
    config;
    articalRepository;
    newFetchLogRepository;
    constructor(httpService, config, articalRepository, newFetchLogRepository) {
        this.httpService = httpService;
        this.config = config;
        this.articalRepository = articalRepository;
        this.newFetchLogRepository = newFetchLogRepository;
    }
    async fetchAndStoreNews(query, number, triggeredByUserId = null) {
        const startTime = Date.now();
        const triggeredBy = triggeredByUserId
            ? database_3.fetchTrigger.ADMIN
            : database_3.fetchTrigger.CORN;
        try {
            const apikey = await this.config.get('WORLD_NEWS_API_KEY');
            const apiurl = await this.config.get('WORLD_NEWS_API_URL');
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(apiurl, {
                params: { text: query, language: 'en', number: number },
                headers: { 'x-api-key': apikey },
            }));
            const articles = response.data.news;
            let storedCount = 0;
            for (const article of articles) {
                if (!article.id || !article.title || !article.url)
                    continue;
                await this.articalRepository.upsertArticle({
                    externalId: article.id,
                    title: article.title,
                    summary: article.summary,
                    url: article.url,
                    image: article.image,
                    author: article.author,
                    language: article.language,
                    catagory: article.category,
                    sourceCountry: article.source_country,
                    sentiment: article.sentiment,
                    publishDated: new Date(article.publish_date),
                    lastRefreshedAt: new Date(),
                });
                storedCount++;
            }
            const log = this.newFetchLogRepository.create({
                query,
                articlesFetched: storedCount,
                triggeredBy,
                triggeredByUserId,
                success: true,
                errorMessage: null,
                durationMs: Date.now() - startTime,
            });
            await this.newFetchLogRepository.save(log);
            return { fetched: storedCount };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown Error ';
            const log = this.newFetchLogRepository.create({
                query,
                articlesFetched: 0,
                triggeredBy,
                triggeredByUserId,
                success: false,
                errorMessage: errorMessage,
                durationMs: Date.now() - startTime,
            });
            await this.newFetchLogRepository.save(log);
            if (errorMessage.includes('401') || errorMessage.includes('403')) {
                throw new common_1.InternalServerErrorException('News API authentication failed - check API Key configuration');
            }
            if (errorMessage.includes('429')) {
                throw new common_1.InternalServerErrorException('News API rate limit exceeded - Wait and retry later');
            }
            if (errorMessage.includes('ECONNREFUSED') ||
                errorMessage.includes('ETIMEOUT')) {
                throw new common_1.InternalServerErrorException('Could not connect to News API - network or server issue');
            }
            throw new common_1.InternalServerErrorException(`Failed to fetch news data : ${errorMessage}`);
        }
    }
};
exports.NewsFetcherService = NewsFetcherService;
exports.NewsFetcherService = NewsFetcherService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService,
        database_1.ArticleRepository,
        database_2.NewsFetchLogRepository])
], NewsFetcherService);
