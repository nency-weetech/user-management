// worker.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NewsFetcherService } from './news/news-fetcher.service';
import { ArticleRepository } from './news/article.repository';
import { NewsFetchLogRepository } from './news/news-fetch-log.repository';
import { MailProcessor } from './mail/mail.processor';
import { RedisModule } from './redis/redis.module';
import { HttpModule } from '@nestjs/axios';
import { NewsProcessor } from './news/news.fetcher.processor';
import { ConfigModule } from '@nestjs/config';
import { datasourceOptions } from './config/data-source';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsQueueService } from './news/news.queue.service';
import { NewsService } from './news/news.service';
import { NewsRefreshCorn } from './news/news-refresh.cron';
import { NewsFetchLog } from './news/entities/news-fetch-log.entity';
import { Article } from './news/entities/article.entity';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(datasourceOptions),
    TypeOrmModule.forFeature([Article, NewsFetchLog]),
    RedisModule,
    HttpModule,
    BullModule.registerQueue({ name: 'newsQueue' }, { name: 'mailQueue' }),
  ],
  providers: [
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
