import { LoggerService } from '@nestjs/common';
export declare class AppLoggerService implements LoggerService {
    private context?;
    count: number;
    constructor();
    private readonly logger;
    setContext(context: string): void;
    log(message: any, ...optionalParams: any[]): void;
    error(message: any, ...optionalParams: any[]): void;
    warn(message: any, ...optionalParams: any[]): void;
    debug(message: any, ...optionalParams: any[]): void;
    verbose(message: any, ...optionalParams: any[]): void;
    private resolveParams;
    getCount(): void;
    private isKnownContext;
}
//# sourceMappingURL=logger.service.d.ts.map