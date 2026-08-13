// worker.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NewsFetcherService } from './news/news-fetcher.service';
import { ArticleRepository, User } from '@myapp/database';
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
    TypeOrmModule.forFeature([Article, NewsFetchLog, User]),
    RedisModule,
    HttpModule,
    BullModule.registerQueue({ name: 'newsQueue' }, { name: 'mailQueue' }),
  ],
  providers: [
    MailProcessor,
    ArticleRepository,
    NewsFetchLogRepository,
    NewsFetcherService,
    NewsQueueService,
    NewsProcessor,
    NewsService,
    NewsRefreshCorn,
  ],
})
export class WorkerModule {}
