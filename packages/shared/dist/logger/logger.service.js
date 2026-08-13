"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppLoggerService = void 0;
const common_1 = require("@nestjs/common");
const winston_1 = __importDefault(require("winston"));
const logger_formatter_1 = require("./logger.formatter");
const logger_transport_1 = require("./logger.transport");
const NEST_SYSTEM_CONTEXT = new Set([
    'RoutesResolver',
    'RouterExplorer',
    'NestApplication',
    'NestFactory',
    'InstanceLoader',
    'WebSocketController',
    'MailService',
    'MailProcessor'
]);
let AppLoggerService = class AppLoggerService {
    context;
    count;
    constructor() {
        this.count = 0;
        console.log('c1', this.count);
        this.count++;
        console.log('c2', this.count);
    }
    logger = winston_1.default.createLogger({
        level: 'info',
        format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), logger_formatter_1.structuredformatter),
        transports: logger_transport_1.winstonTransport,
    });
    setContext(context) {
        this.context = context;
    }
    log(message, ...optionalParams) {
        const { meta, resolvedContext, level } = this.resolveParams(optionalParams);
        this.logger.log(level, String(message), { function: resolvedContext, meta });
    }
    error(message, ...optionalParams) {
        const trace = typeof optionalParams[0] === 'string' && !this.isKnownContext(optionalParams[0])
            ? optionalParams[0]
            : undefined;
        const rest = trace ? optionalParams.slice(1) : optionalParams;
        const { meta, resolvedContext } = this.resolveParams(rest);
        this.logger.error(String(message), { function: resolvedContext, meta, stack: trace });
    }
    warn(message, ...optionalParams) {
        const { meta, resolvedContext, level } = this.resolveParams(optionalParams);
        this.logger.warn(String(message), { function: resolvedContext, meta });
    }
    debug(message, ...optionalParams) {
        const { meta, resolvedContext } = this.resolveParams(optionalParams);
        this.logger.debug(String(message), { function: resolvedContext, meta });
    }
    verbose(message, ...optionalParams) {
        const { meta, resolvedContext } = this.resolveParams(optionalParams);
        this.logger.verbose(String(message), { function: resolvedContext, meta });
    }
    resolveParams(optionalParams) {
        const first = optionalParams[0];
        if (typeof first === 'string') {
            const isSystem = this.isKnownContext(first);
            return {
                resolvedContext: first,
                level: isSystem ? 'debug' : 'info'
            };
        }
        return {
            meta: first,
            resolvedContext: this.context,
            level: 'info'
        };
    }
    getCount() {
        this.count++;
        console.log('getcount : ', this.count);
    }
    isKnownContext(context) {
        return NEST_SYSTEM_CONTEXT.has(context);
    }
};
exports.AppLoggerService = AppLoggerService;
exports.AppLoggerService = AppLoggerService = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.TRANSIENT }),
    __metadata("design:paramtypes", [])
], AppLoggerService);
//# sourceMappingURL=logger.service.js.map