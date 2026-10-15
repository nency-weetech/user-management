"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerHttpMiddleware = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const logger_context_1 = require("../logger.context");
let LoggerHttpMiddleware = class LoggerHttpMiddleware {
    use(req, res, next) {
        const reqId = req.headers['x-request-id'] || (0, crypto_1.randomUUID)();
        res.setHeader('x-request-id', reqId);
        const context = {
            type: 'http',
            reqId,
            method: req.method,
            url: req.originalUrl,
            userAgent: req.headers['user-agent'],
            ip: req.ip
        };
        logger_context_1.LoggerContext.run(context, () => next());
    }
};
exports.LoggerHttpMiddleware = LoggerHttpMiddleware;
exports.LoggerHttpMiddleware = LoggerHttpMiddleware = __decorate([
    (0, common_1.Injectable)()
], LoggerHttpMiddleware);
//# sourceMappingURL=logger.http.middleware.js.map