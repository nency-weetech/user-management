import { Logger } from '@nestjs/common';
export declare class LoggerCleanupservice {
    private readonly logger;
    constructor(logger: Logger);
    handleOldZipLog(): Promise<void>;
    handledDeleteExpiredLog(): Promise<void>;
    private safeReadDir;
    private gzipFile;
}
//# sourceMappingURL=logger.cleanup.service.d.ts.map