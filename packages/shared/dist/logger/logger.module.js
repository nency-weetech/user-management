"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const winston_config_1 = require("../config/winston.config");
const logger_http_middleware_1 = require("./context/logger.http.middleware");
const nest_winston_1 = require("nest-winston");
const logger_cleanup_service_1 = require("./logger.cleanup.service");
let LoggerModule = class LoggerModule {
    configure(consumer) {
        consumer.apply(logger_http_middleware_1.LoggerHttpMiddleware).forRoutes('*');
    }
};
exports.LoggerModule = LoggerModule;
exports.LoggerModule = LoggerModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [schedule_1.ScheduleModule.forRoot(), nest_winston_1.WinstonModule.forRoot(winston_config_1.winstonConfig)],
        providers: [logger_cleanup_service_1.LoggerCleanupservice]
    })
], LoggerModule);
//# sourceMappingURL=logger.module.js.map