import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { LoggerContext } from "../logger.context";

@Injectable()
export class LoggerUserInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const req = context.switchToHttp().getRequest()
        if(req.user?.id){
            LoggerContext.set({userId : req.user.id})
        }
        return next.handle();
    }
}