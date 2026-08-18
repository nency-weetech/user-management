import { ArgumentsHost, ExceptionFilter, Logger } from "@nestjs/common";
export declare class AllExceptionFilter implements ExceptionFilter {
    private readonly logger;
    constructor(logger: Logger);
    catch(exception: any, host: ArgumentsHost): void;
}
//# sourceMappingURL=all-exceptions.filter.d.ts.map