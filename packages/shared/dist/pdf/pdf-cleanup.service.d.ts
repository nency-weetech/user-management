import { PdfJob } from '@myapp/database';
import { Repository } from 'typeorm';
import { StorageService } from './storage.service';
export declare class PdfCleanupService {
    private readonly jobs;
    private readonly storageService;
    private readonly logger;
    constructor(jobs: Repository<PdfJob>, storageService: StorageService);
    cleanup(): Promise<void>;
    cleanupExpiredReadyJobs(): Promise<void>;
    cleanupStuckProcessingJobs(): Promise<void>;
}
//# sourceMappingURL=pdf-cleanup.service.d.ts.map