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
var NewsQueueService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsQueueService = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const bullmq_2 = require("bullmq");
let NewsQueueService = NewsQueueService_1 = class NewsQueueService {
    newsQueue;
    logger = new common_1.Logger(NewsQueueService_1.name);
    constructor(newsQueue) {
        this.newsQueue = newsQueue;
    }
    async queueNewsFetch(query, number, triggeredByUserId = null) {
        const isTest = process.env.NODE_ENV === 'test';
        const job = await this.newsQueue.add('fetch-news', { query, number, triggeredByUserId }, {
            attempts: isTest ? 1 : 3,
            backoff: isTest ? undefined : { type: 'exponential', delay: 3000 },
            removeOnComplete: false,
            removeOnFail: false,
        });
        if (!query || query.trim() === '') {
            throw new common_1.BadRequestException('Query is required and cannot be empty');
        }
        this.logger.log(`News fetch job queued: query="${query}", number=${number}`);
        return { jobId: job.id };
    }
    async getJobState(jobId) {
        const job = await this.newsQueue.getJob(jobId);
        if (!job) {
            throw new common_1.NotFoundException(`job with id ${jobId} not found`);
        }
        const state = await job.getState();
        switch (state) {
            case 'completed':
                return {
                    success: true,
                    status: 'Completed',
                    message: 'News fetch completed successfully',
                    jobId: job.id,
                    result: job.returnvalue,
                };
            case 'failed':
                return {
                    success: false,
                    status: 'Failed',
                    message: 'News fetch failed after all retry attempts',
                    jobId: job.id,
                    jobName: job.name,
                    failedReason: job.failedReason,
                    error: job.failedReason,
                    attemptsMade: job.attemptsMade,
                    failedAt: job.finishedOn,
                };
            case 'active':
                return {
                    success: null,
                    status: 'Active',
                    message: 'News fetch is curently process',
                    jobId: job.id,
                };
            case 'waiting':
            case 'delayed':
                return {
                    success: null,
                    status: state,
                    message: 'News fetch job is queued and waiting to be processed',
                    jobId: job.id,
                };
            default:
                return {
                    success: null,
                    status: state,
                    message: `Job is in ${state} stage`,
                    jobId: job.id,
                };
        }
    }
    async getFailedJobs() {
        try {
            const failedJob = await this.newsQueue.getJobs(['failed']);
            return failedJob.map((job) => ({
                jobId: job.id,
                query: job.data.query,
                number: job.data.number,
                failedReason: job.failedReason,
                attemptsMade: job.attemptsMade,
                failedAt: job.finishedOn
                    ? new Date(job.finishedOn).toISOString()
                    : null,
            }));
        }
        catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Unknown Internal Server Error';
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
    async retryFaildJob(jobId) {
        const job = await this.newsQueue.getJob(jobId);
        if (!job) {
            throw new common_1.NotFoundException(`Job with ID ${jobId} Not found`);
        }
        const state = await job.getState();
        if (state !== 'failed') {
            `Job ${jobId} is not in "failed" state (current: ${state}). Only failed jobs can be retried.`;
        }
        await job.retry();
        this.logger.log(`Job ${jobId} manually retried`);
        return {
            message: `Job ${jobId} has been re-queued for processing`,
            jobId: job.id,
        };
    }
};
exports.NewsQueueService = NewsQueueService;
exports.NewsQueueService = NewsQueueService = NewsQueueService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_1.InjectQueue)('newsQueue')),
    __metadata("design:paramtypes", [bullmq_2.Queue])
], NewsQueueService);
