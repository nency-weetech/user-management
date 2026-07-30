import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { ArticleRepository } from './article.repository';
import { NewsFetcherService } from './news-fetcher.service';
import { HttpModule } from '@nestjs/axios';
import { NewsRefreshCorn } from './news-refresh.cron';

@Module({
  imports: [TypeOrmModule.forFeature([Article]), HttpModule],
  controllers: [NewsController],
  providers: [ArticleRepository, NewsFetcherService, NewsService, NewsRefreshCorn],
})
export class NewsModule {}
