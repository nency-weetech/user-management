"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.winstonTransport = exports.consoleTransprot = exports.dailyReportTransport = void 0;
const winston_1 = __importDefault(require("winston"));
require("winston-daily-rotate-file");
const LOG_DIR = process.env.LOG_DIR || 'logs';
exports.dailyReportTransport = new winston_1.default.transports.DailyRotateFile({
    dirname: LOG_DIR,
    filename: 'app-%DATE%.log',
    datePattern: 'YYYY-MM-DD--HH-MM',
    zippedArchive: false,
    maxSize: '50m',
    utc: false
});
exports.consoleTransprot = new winston_1.default.transports.Console();
exports.winstonTransport = [exports.consoleTransprot, exports.dailyReportTransport];
//# sourceMappingURL=logger.transport.js.map