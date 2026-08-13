"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// logger.factory.ts
const winston = __importStar(require("winston"));
const logger_formatter_1 = require("./logger.formatter");
const logger_transport_1 = require("./logger.transport");
// export function winstonConfig (){
//   const transport : winston.transport[] = [new winston.transports.Console(
//     winston
//   )]
//   return {
//     level : 'debug',
//     transport,
//   }
// }
const NEST_SYSTEM_CONTEXT = new Set([
    'RoutesResolver',
    'RouterExplorer',
    'NestApplication',
    'NestFactory',
    'InstanceLoader',
    'WebSocketsController',
]);
const winstonLogger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), logger_formatter_1.structuredformatter),
    transports: logger_transport_1.winstonTransport,
});
function createAppLogger(initialContext) {
    let context = initialContext;
    function resolveParams(optionalParams) {
        const first = optionalParams[0];
        if (typeof first === 'string') {
            const isSystem = NEST_SYSTEM_CONTEXT.has(first);
            return { resolvedContext: first, level: isSystem ? 'debug' : 'info' };
        }
        return {
            meta: first,
            resolvedContext: context,
            level: context && NEST_SYSTEM_CONTEXT.has(context) ? 'debug' : 'info',
        };
    }
    return {
        setContext(newContext) {
            context = newContext;
        },
        log(message, ...optionalParams) {
            const { meta, resolvedContext, level } = resolveParams(optionalParams);
            winstonLogger.log(level, String(message), { function: resolvedContext, meta });
        },
        error(message, ...optionalParams) {
            const trace = typeof optionalParams[0] === 'string' && !NEST_SYSTEM_CONTEXT.has(optionalParams[0])
                ? optionalParams[0]
                : undefined;
            const rest = trace ? optionalParams.slice(1) : optionalParams;
            const { meta, resolvedContext } = resolveParams(rest);
            winstonLogger.error(String(message), { function: resolvedContext, meta, stack: trace });
        },
        warn(message, ...optionalParams) {
            const { meta, resolvedContext } = resolveParams(optionalParams);
            winstonLogger.warn(String(message), { function: resolvedContext, meta });
        },
        debug(message, ...optionalParams) {
            const { meta, resolvedContext } = resolveParams(optionalParams);
            winstonLogger.debug(String(message), { function: resolvedContext, meta });
        },
        verbose(message, ...optionalParams) {
            const { meta, resolvedContext } = resolveParams(optionalParams);
            winstonLogger.verbose(String(message), { function: resolvedContext, meta });
        },
    };
}
//# sourceMappingURL=logger.config.js.map