import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Inject, Logger } from "@nestjs/common";
import { WINSTON_MODULE_NEST_PROVIDER, WINSTON_MODULE_PROVIDER } from "nest-winston";
import { timestamp } from "rxjs";

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
    constructor(@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger){}

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();

        const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        const message = exception instanceof HttpException ? exception.getResponse() : 'Internal server error';

        this.logger.error(
            `${request.method} ${request.url} - Status : ${status}`,
            exception instanceof Error ? exception.stack : String(exception),
        )

        response.status(status).json({
            statusCode : status,
            timestamp : new Date().toISOString(),
            path : request.url,
            message
        })
    }
}