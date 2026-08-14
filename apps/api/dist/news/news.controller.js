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
exports.NewsController = void 0;
const common_1 = require("@nestjs/common");
const news_service_1 = require("./news.service");
const auth_guard_1 = require("../guards/auth/auth.guard");
const role_guard_1 = require("../guards/role/role.guard");
const role_decorator_1 = require("../decorators/role.decorator");
const database_1 = require("@myapp/database");
const current_user_decorator_1 = require("../decorators/current-user.decorator");
const database_2 = require("@myapp/database");
const database_3 = require("@myapp/database");
const update_article_dto_1 = require("./dtos/update-article.dto");
const swagger_1 = require("@nestjs/swagger");
const news_queue_service_1 = require("./news.queue.service");
let NewsController = class NewsController {
    newsService;
    newsQueueService;
    newsFetchLogRepository;
    constructor(newsService, newsQueueService, newsFetchLogRepository) {
        this.newsService = newsService;
        this.newsQueueService = newsQueueService;
        this.newsFetchLogRepository = newsFetchLogRepository;
    }
    // @Get('test-fetch')
    // async testFetch(){
    //   return this.newsFetcherService.fetchAndStoreNews('technology', 2);
    // }
    async refreshNes(dto, admin) {
        const { jobId } = await this.newsQueueService.queueNewsFetch(dto.query, dto.number ?? 5, admin.id);
        return {
            status: 202,
            jobId,
            message: 'your request is pending please wait while',
        };
    }
    async getFailedJobs() {
        return this.newsQueueService.getFailedJobs();
    }
    async retryJob(jobId) {
        return this.newsQueueService.retryFaildJob(jobId);
    }
    async getJobStatus(jobId) {
        return this.newsQueueService.getJobState(jobId);
    }
    async fetchHistory(limit) {
        return this.newsFetchLogRepository.findRecent(Number(limit));
    }
    async fetchStats() {
        const sinceDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return this.newsFetchLogRepository.getStats(sinceDate);
    }
    async findAll(page = 1, limit = 10, category) {
        return this.newsService.findAll(Number(page), Number(limit), category);
    }
    async remove(id) {
        const deleteArticle = await this.newsService.remove(id);
        return { message: 'Article deleted', deleteArticle };
    }
    async updateArticle(id, dto) {
        return this.newsService.update(id, dto);
    }
};
exports.NewsController = NewsController;
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Triggered an on-demand news refresh from external API (Admin only)',
    }),
    (0, swagger_1.ApiCookieAuth)('accessToken'),
    (0, swagger_1.ApiBody)({ schema: { example: { query: 'technology', number: 5 } } }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Refresh completed, return fetched cound',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin role reuire' }),
    (0, common_1.Post)('refresh'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, role_decorator_1.Roles)([database_1.UserRole.ADMIN]),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.currentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, database_2.User]),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "refreshNes", null);
__decorate([
    (0, common_1.Get)('failed-jobs'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, role_decorator_1.Roles)([database_1.UserRole.ADMIN]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "getFailedJobs", null);
__decorate([
    (0, common_1.Get)('/retry-job/:jobId'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, role_decorator_1.Roles)([database_1.UserRole.ADMIN]),
    __param(0, (0, common_1.Param)('jobId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "retryJob", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Check the status of a queued news-fetch job',
        description: 'Returns the current state of a BullMQ job — waiting, active, completed, or failed. Use this to poll after triggering a news fetch.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'jobId',
        description: 'The BullMQ job ID returned when the fetch was triggered',
        example: '5',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Job status retrieved successfully',
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Job not found (invalid ID or already expired/cleaned up)',
    }),
    (0, swagger_1.ApiCookieAuth)('accessToken'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, role_decorator_1.Roles)([database_1.UserRole.ADMIN]),
    (0, common_1.Get)('job-status/:jobId'),
    __param(0, (0, common_1.Param)('jobId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "getJobStatus", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get recent news fetch history (admin only)' }),
    (0, swagger_1.ApiCookieAuth)('accessToken'),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, example: 20 }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Fetch history return' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin role require' }),
    (0, common_1.Get)('fetch-history'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, role_decorator_1.Roles)([database_1.UserRole.ADMIN]),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "fetchHistory", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Get news fetch statistic for the last 7 days (admin only)',
    }),
    (0, swagger_1.ApiCookieAuth)('accessToken'),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Stats returned (total, failed, success rate, avg duration)',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin role require' }),
    (0, common_1.Get)('fetch-stats'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, role_decorator_1.Roles)([database_1.UserRole.ADMIN]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "fetchStats", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get pagineted list of news article' }),
    (0, swagger_1.ApiCookieAuth)('accessToken'),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Article return' }),
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Delete an article by id (admin only)' }),
    (0, swagger_1.ApiCookieAuth)('accessToken'),
    (0, swagger_1.ApiQuery)({ name: 'id', description: 'Article id' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Article deleted' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin role require' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Article not found' }),
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, role_decorator_1.Roles)([database_1.UserRole.ADMIN]),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "remove", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Update article by id (admin only)' }),
    (0, swagger_1.ApiCookieAuth)('accessToken'),
    (0, swagger_1.ApiQuery)({ name: 'id', description: 'Article id' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Article updated' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin role require' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Article not found' }),
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, role_decorator_1.Roles)([database_1.UserRole.ADMIN]),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_article_dto_1.UpdateArticleDto]),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "updateArticle", null);
exports.NewsController = NewsController = __decorate([
    (0, swagger_1.ApiTags)('News'),
    (0, common_1.Controller)('news'),
    __metadata("design:paramtypes", [news_service_1.NewsService,
        news_queue_service_1.NewsQueueService,
        database_3.NewsFetchLogRepository])
], NewsController);
