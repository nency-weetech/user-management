// worker.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NewsFetcherService } from './news/news-fetcher.service';
import { ArticleRepository, PaymentRepository, Payments, User, UserPlan, UserPlanRepository } from '@myapp/database';
import { NewsFetchLogRepository } from '@myapp/database';
import { MailProcessor } from './mail/mail.processor';
import { RedisModule } from './redis/redis.module';
import { HttpModule } from '@nestjs/axios';
import { NewsProcessor } from './news/news.fetcher.processor';
import { ConfigModule } from '@nestjs/config';
import { datasourceOptions } from '@myapp/database';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsQueueService, UsersService } from '@myapp/api';
import { NewsService } from '@myapp/api/src/news/news.service';
import { NewsRefreshCorn } from './news/news-refresh.cron';
import { NewsFetchLog } from '@myapp/database';
import { Article } from '@myapp/database';
import { LoggerModule } from '@myapp/shared';
import path from 'path';
import { PaymentEventProcessor } from './billing/payment-event.processor';

@Module({
  imports: [
   ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        path.resolve(__dirname, '../.env'),
        path.resolve(process.cwd(), '../../.env'),
      ],
    }),
    LoggerModule,
    TypeOrmModule.forRoot(datasourceOptions),
    TypeOrmModule.forFeature([Article, NewsFetchLog, User, Payments, UserPlan]),
    RedisModule,
    HttpModule,
    BullModule.registerQueue({ name: 'newsQueue' }, { name: 'mailQueue' }, {name: 'billingQueue'}),
  ],
  providers: [
    MailProcessor,
    
    PaymentEventProcessor,
    PaymentRepository,
    UserPlanRepository,
    
    ArticleRepository,
    NewsFetchLogRepository,
    NewsFetcherService,
    NewsQueueService,
    NewsProcessor,
    NewsRefreshCorn,
  ],
})
export class WorkerModule {}
