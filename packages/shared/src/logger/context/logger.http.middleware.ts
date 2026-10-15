import { Injectable, NestMiddleware } from "@nestjs/common";
import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";
import { HttpContextData } from "../logger.interface";
import { LoggerContext } from "../logger.context";

@Injectable()
export class LoggerHttpMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next : NextFunction){
        const reqId = (req.headers['x-request-id'] as string) || randomUUID();
        res.setHeader('x-request-id', reqId);

        const context: HttpContextData = {
            type: 'http',
            reqId,
            method: req.method,
            url: req.originalUrl,
            userAgent: req.headers['user-agent'],
            ip: req.ip
        }
        LoggerContext.run(context, () => next())
    }
}