import winston from 'winston';
import { TransformableInfo } from 'logform';
import { LoggerContext } from './logger.context';
import { LogEntry } from './logger.interface';

const SERVICE_NAME = process.env.SERVICE_NAME || 'my-service';

interface AppLogInfo extends TransformableInfo {
  timestamp?: string;
  function?: string;
  meta?: Record<string, any>;
  stack?: string;
}
export const structuredformatter = winston.format.printf((rawInfo) => {
  const info = rawInfo as AppLogInfo;
  const context = LoggerContext.get();

  const logEntry: LogEntry = {
    timestamp: info.timestamp ?? new Date().toISOString(),
    level: info.level,
    message: info.message as any,
    service: SERVICE_NAME,
    function: info.function || undefined,
    context: context || undefined,
    ...(info.meta ? { meta: info.meta } : {}),
    ...(info.stack ? { stack: info.stack } : {}),
  };
  return JSON.stringify(logEntry);
});
