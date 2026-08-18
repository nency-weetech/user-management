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
exports.NewsFetchLogRepository = void 0;
const base_repository_1 = require("../common/base.repository");
const news_fetch_log_entity_1 = require("../entities/news-fetch-log.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let NewsFetchLogRepository = class NewsFetchLogRepository extends base_repository_1.BaseAbstractRepostitory {
    newsFetchLogRepository;
    constructor(newsFetchLogRepository) {
        super(newsFetchLogRepository);
        this.newsFetchLogRepository = newsFetchLogRepository;
    }
    async findRecent(limit) {
        const log = await this.newsFetchLogRepository.find({
            order: { createdAt: 'DESC' },
            take: limit,
            //relations: {triggeredByUser : true}, -- for all detail of Admin-user
        });
        return log;
    }
    async countFailuersSince(date) {
        return this.newsFetchLogRepository.count({
            where: { success: false, createdAt: (0, typeorm_2.MoreThan)(date) },
        });
    }
    async getStats(sinceDate) {
        const total = await this.newsFetchLogRepository.count({
            where: { createdAt: (0, typeorm_2.MoreThan)(sinceDate) },
        });
        const failauer = await this.countFailuersSince(sinceDate);
        const avgDuration = await this.newsFetchLogRepository
            .createQueryBuilder('log')
            .select('AVG(log.durationMs)', 'avg')
            .where('log.createdAt > :sinceDate', { sinceDate })
            .getRawOne();
        return {
            TotalFetches: total,
            FailedFetch: failauer,
            SuccessRate: total > 0 ? (((total - failauer) / total) * 100).toFixed(3) : 100,
            AvgDurationMs: Number(avgDuration?.avg ?? 0).toFixed(3),
        };
    }
    async sumArticleFetchToday(userId) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const result = await this.newsFetchLogRepository
            .createQueryBuilder('log')
            .select('SUM(log.articlesFetched)', 'total')
            .where('log.triggeredByUserId = :userId', { userId })
            .andWhere('log.triggeredBy = :triggeredBy', { triggeredBy: 'admin' })
            .andWhere('log.createdAt >= :startOfDay', { startOfDay })
            .getRawOne();
        return Number(result?.total) || 0;
    }
};
exports.NewsFetchLogRepository = NewsFetchLogRepository;
exports.NewsFetchLogRepository = NewsFetchLogRepository = __decorate([
    __param(0, (0, typeorm_1.InjectRepository)(news_fetch_log_entity_1.NewsFetchLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], NewsFetchLogRepository);
