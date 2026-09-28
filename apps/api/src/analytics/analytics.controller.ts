import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('article-relationships')
  getArticleRelation (){
    return this.analyticsService.getArticleRelation();
  }

  @Get('article-relationships/refresh')
  refreshArticleRelationship(){
    return this.analyticsService.refreshArticleRelationship();
  }
}
