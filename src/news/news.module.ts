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

@Module({
  imports: [TypeOrmModule.forFeature([Article, NewsFetchLog]), HttpModule],
  controllers: [NewsController],
  providers: [
    ArticleRepository,
    NewsFetchLogRepository,
    NewsFetcherService,
    NewsService,
    NewsRefreshCorn,
  ],
})
export class NewsModule {}
