import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { ArticleRepository } from './article.repository';
import { NewsFetcherService } from './news-fetcher.service';
import { HttpModule } from '@nestjs/axios';
import { NewsRefreshCorn } from './news-refresh.cron';
import { NewsFetchLog } from './entities/news-fetch-log.entity';
import { NewsFetchLogRepository } from './news-fetch-log.repository';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { NewsQueueService } from './news.queue.service';
import { NewsProcessor } from './news.fetcher.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article, NewsFetchLog]),
    HttpModule,
    BullModule.registerQueue({
      name: 'newsQueue',
    }),
    BullBoardModule.forFeature({
      name: 'newsQueue',
      adapter: BullMQAdapter,
    }),
  ],
  controllers: [NewsController],
  providers: [
    ArticleRepository,
    NewsFetchLogRepository,
    NewsFetcherService,
    NewsQueueService,
    NewsProcessor,
    NewsService,
    NewsRefreshCorn,
  ],
  exports: [NewsQueueService]
})
export class NewsModule {}
