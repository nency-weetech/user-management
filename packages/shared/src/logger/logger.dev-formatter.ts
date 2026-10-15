import * as winston from 'winston';
import { TransformableInfo } from 'logform';
import { LoggerContext } from './logger.context';

interface AppLogInfo extends TransformableInfo {
  timestamp?: string;
  function?: string;
  meta?: Record<string, any>;
  stack?: string;
}

export const devFormatter = winston.format.combine(
  winston.format.colorize(),
  winston.format.prettyPrint(),
  winston.format.printf((rawInfo) => {
    const info = rawInfo as AppLogInfo;
    const context = LoggerContext.get();
    const fn = info.function ? `[${info.function}]` : '';
    const time = typeof info.timestamp === 'string' ? info.timestamp.split('T')[1]?.replace('Z', ''): '';
    let contextStr = '';
    if(context?.type === 'http'){
        contextStr = ` reqId=${context.reqId}${context.userId ? ` userId=${context.userId}` : ''}`;
    }else if(context?.type === 'job'){
        contextStr = ` jobId=${context.jobId} job=${context.jobName} queue=${context.queueName}`;
    }
     const metaStr = info.meta ? ` ${JSON.stringify(info.meta)}` : '';
    const stackStr = info.stack ? `\n${info.stack}` : '';

    return `${time} ${info.level} ${fn} ${info.message}${contextStr}${metaStr}${stackStr}`;
  }),
);
