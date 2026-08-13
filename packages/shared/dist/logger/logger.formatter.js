"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.structuredformatter = void 0;
const winston_1 = __importDefault(require("winston"));
const logger_context_1 = require("./logger.context");
const SERVICE_NAME = process.env.SERVICE_NAME || 'my-service';
exports.structuredformatter = winston_1.default.format.printf((rawInfo) => {
    const info = rawInfo;
    const context = logger_context_1.LoggerContext.get();
    const logEntry = {
        timestamp: info.timestamp ?? new Date().toISOString(),
        level: info.level,
        message: info.message,
        service: SERVICE_NAME,
        function: info.function || undefined,
        context: context || undefined,
        ...(info.meta ? { meta: info.meta } : {}),
        ...(info.stack ? { stack: info.stack } : {}),
    };
    return JSON.stringify(logEntry);
});
//# sourceMappingURL=logger.formatter.js.map