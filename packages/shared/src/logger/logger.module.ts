import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { winstonConfig } from '../config/winston.config';
import { LoggerHttpMiddleware } from './context/logger.http.middleware';
import { WinstonModule } from 'nest-winston';
import { LoggerCleanupservice } from './logger.cleanup.service';

@Global()
@Module({
  imports: [ScheduleModule.forRoot(), WinstonModule.forRoot(winstonConfig)],
  providers : [LoggerCleanupservice]
})
export class LoggerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerHttpMiddleware).forRoutes('*');
  }
}
