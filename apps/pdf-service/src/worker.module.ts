// worker.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { datasourceOptions } from '@myapp/database';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from '@myapp/shared';
import path from 'path';
import { RedisModule } from '@myapp/redis-module';
import { PdfModule } from './pdf/pdf.module';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        path.resolve(__dirname, '../.env'),
        path.resolve(process.cwd(), '../../.env'),
      ],
    }),

    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
    }),

    PdfModule,

    LoggerModule,
    TypeOrmModule.forRoot(datasourceOptions),
    RedisModule,
  ],
})
export class WorkerModule {}
