"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerCleanupservice = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const nest_winston_1 = require("nest-winston");
const path_1 = __importDefault(require("path"));
const logger_job_util_1 = require("./context/logger.job.util");
const fsSync = __importStar(require("fs"));
const fs = __importStar(require("fs/promises"));
const zlib = __importStar(require("zlib"));
const promises_1 = require("stream/promises");
const LOG_DIR = [
    path_1.default.resolve(process.cwd(), 'logs/error'),
    path_1.default.resolve(process.cwd(), 'logs/combined'),
];
const ZIP_AFTER_MS = 48 * 60 * 60 * 1000;
//const ZIP_AFTER_MS = 1 * 60 * 1000;
const DELETE_AFTER_MS = 30 * 24 * 60 * 60 * 1000;
//const DELETE_AFTER_MS = 1 * 60 * 1000;
let LoggerCleanupservice = class LoggerCleanupservice {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    async handleOldZipLog() {
        await (0, logger_job_util_1.runWithJobContext)({ jobName: 'ZipOldJob' }, async () => {
            for (const dir of LOG_DIR) {
                const files = await this.safeReadDir(dir);
                const now = Date.now();
                for (const file of files) {
                    if (!file.endsWith('.log'))
                        continue;
                    const fullpath = path_1.default.join(dir, file);
                    try {
                        const stats = await fs.stat(fullpath);
                        const age = now - stats.mtimeMs;
                        if (age < ZIP_AFTER_MS)
                            continue;
                        await this.gzipFile(fullpath);
                        await fs.unlink(fullpath);
                        this.logger.log('Zipped old log file', {
                            function: 'LoggerCleanupService',
                            meta: { file, dir },
                        });
                    }
                    catch (error) {
                        const err = error instanceof Error ? error : new Error(String(error));
                        this.logger.error('Failed to zip old log file', {
                            function: 'LoggerCleanupService',
                            meta: { file, dir },
                            error: {
                                name: err.name,
                                message: err.message,
                                stack: err.stack,
                            },
                        });
                    }
                }
            }
        });
    }
    async handledDeleteExpiredLog() {
        await (0, logger_job_util_1.runWithJobContext)({ jobName: 'DeleteExpiredLog' }, async () => {
            for (const dir of LOG_DIR) {
                const files = await this.safeReadDir(dir);
                const now = Date.now();
                for (const file of files) {
                    if (!file.endsWith('.gz'))
                        continue;
                    const fullpath = path_1.default.join(dir, file);
                    const stats = await fs.stat(fullpath);
                    const age = now - stats.mtimeMs;
                    if (age >= DELETE_AFTER_MS) {
                        try {
                            await fs.unlink(fullpath);
                            this.logger.log('Deleted expired log file', {
                                function: 'LoggerCleanupService',
                                meta: { file, dir },
                            });
                        }
                        catch (error) {
                            this.logger.error('Failed to delete expired log file', {
                                function: 'LoggerCleanupService',
                                meta: { file, dir },
                                stack: error.stack,
                            });
                        }
                    }
                }
            }
        });
    }
    async safeReadDir(dir) {
        try {
            return await fs.readdir(dir);
        }
        catch {
            return [];
        }
    }
    async gzipFile(filePath) {
        const gzip = zlib.createGzip();
        const source = fsSync.createReadStream(filePath);
        const destination = fsSync.createWriteStream(`${filePath}.gz`);
        await (0, promises_1.pipeline)(source, gzip, destination);
    }
};
exports.LoggerCleanupservice = LoggerCleanupservice;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LoggerCleanupservice.prototype, "handleOldZipLog", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LoggerCleanupservice.prototype, "handledDeleteExpiredLog", null);
exports.LoggerCleanupservice = LoggerCleanupservice = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(nest_winston_1.WINSTON_MODULE_NEST_PROVIDER)),
    __metadata("design:paramtypes", [common_1.Logger])
], LoggerCleanupservice);
//# sourceMappingURL=logger.cleanup.service.js.map