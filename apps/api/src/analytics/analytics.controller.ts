import { Controller, Get, Query } from '@nestjs/common';
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

  @Get('sale-summary')
  getSaleSummary(
    @Query('plan') plan ?: string,
    @Query('targetType') targetType ?: string,
    @Query('fromDate') fromDate ?: string,
    @Query('toDate') toDate ?: string,
  ){
    return this.analyticsService.getSalesSummary(plan, targetType, fromDate, toDate);
  }

  @Get('sale-summary/refresh')
  refreshSalesSummary(){
    return this.analyticsService.refreshSalesSummary();
  }

}
