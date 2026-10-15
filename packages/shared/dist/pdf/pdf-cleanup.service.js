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
var PdfCleanupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfCleanupService = void 0;
const database_1 = require("@myapp/database");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const pdf_storage_service_1 = require("./pdf.storage.service");
const PROCESSING_TIMEOUT_MINUTES = 10;
let PdfCleanupService = PdfCleanupService_1 = class PdfCleanupService {
    jobs;
    storageService;
    logger = new common_1.Logger(PdfCleanupService_1.name);
    constructor(jobs, storageService) {
        this.jobs = jobs;
        this.storageService = storageService;
    }
    async cleanup() {
        await this.cleanupExpiredReadyJobs();
        await this.cleanupStuckProcessingJobs();
    }
    async cleanupExpiredReadyJobs() {
        const now = new Date();
        const jobs = await this.jobs.find({
            where: {
                status: database_1.PdfJobStatus.READY,
                expires_at: (0, typeorm_2.LessThan)(now),
            },
        });
        this.logger.log(`Found ${jobs.length} expired READY PDF jobs`);
        for (const job of jobs) {
            try {
                if (!job.object_key) {
                    await this.jobs.update(job.id, {
                        status: database_1.PdfJobStatus.EXPIRED,
                    });
                    this.logger.log(`PDF job expired without object: jobId=${job.id}`);
                    continue;
                }
                await this.storageService.remove(job.object_key);
                await this.jobs.update(job.id, {
                    status: database_1.PdfJobStatus.EXPIRED,
                });
                this.logger.log(`PDF expired and object deleted: jobId=${job.id}`);
            }
            catch (error) {
                this.logger.error(`Failed to cleanup PDF job: jobId=${job.id}, objectKey=${job.object_key}`, error instanceof Error ? error.stack : String(error));
            }
        }
    }
    async cleanupStuckProcessingJobs() {
        const timeout = new Date(Date.now() - PROCESSING_TIMEOUT_MINUTES * 60 * 1000);
        const jobs = await this.jobs.find({
            where: {
                status: database_1.PdfJobStatus.PROCESSING,
                updated_at: (0, typeorm_2.LessThan)(timeout),
            },
        });
        this.logger.log(`Found ${jobs.length} stuck PROCESSING PDF jobs`);
        for (const job of jobs) {
            try {
                await this.jobs.update(job.id, {
                    status: database_1.PdfJobStatus.FAILED,
                    error: 'timed out',
                });
                this.logger.warn(`PDF job marked as timed out: jobId=${job.id}`);
            }
            catch (error) {
                this.logger.error(`Failed to mark PDF job as timed out: jobId=${job.id}`, error instanceof Error ? error.stack : String(error));
            }
        }
    }
};
exports.PdfCleanupService = PdfCleanupService;
exports.PdfCleanupService = PdfCleanupService = PdfCleanupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(database_1.PdfJob)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        pdf_storage_service_1.PdfStorage])
], PdfCleanupService);
//# sourceMappingURL=pdf-cleanup.service.js.map