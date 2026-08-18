import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import { structuredformatter } from '../logger/logger.formatter';
import { devFormatter } from '../logger/logger.dev-formatter';
import 'winston-daily-rotate-file';

const isProduction = process.env.NODE_ENV === 'production';
//const isProduction = true;

const isTest = process.env.NODE_ENV === 'test';

const consoleTransport = new winston.transports.Console({
  silent: isTest,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.ms(),
    winston.format.errors({ stack: true }),
    isProduction ? structuredformatter : devFormatter,
  ),
});

export const winstonConfig = (() => {
  const transports: winston.transport[] = [consoleTransport]; 
  if (isProduction) {
    transports.push(
      new winston.transports.DailyRotateFile({
        dirname: 'logs/error',
        filename: 'error-%DATE%.log',
        level: 'error',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: false,
        maxSize: '50m',
        format: winston.format.combine(winston.format.timestamp(), structuredformatter),
      }),
      new winston.transports.DailyRotateFile({
        dirname: 'logs/combined',
        filename: 'combine-%DATE%.log',
        datePattern: 'YYYY-MM-DD-HH-mm',
        zippedArchive: false,
        maxSize: '50m',
        format: winston.format.combine(winston.format.timestamp(), structuredformatter),
      }),
    );
  }
  return {
    level: isTest ? 'silent' : isProduction ? 'info' : 'debug',
    silent: isTest,
    transports, 
  };
})();