import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '@myapp/database';
import { ArticleRepository } from '@myapp/database';
import { HttpModule } from '@nestjs/axios';
import { NewsFetchLog } from '@myapp/database';
import { NewsFetchLogRepository } from '@myapp/database';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { NewsQueueService } from './news.queue.service';

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
    NewsQueueService,
    NewsService,
  ],
  exports: [NewsQueueService]
})
export class NewsModule {}
