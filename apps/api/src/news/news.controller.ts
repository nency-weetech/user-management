import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { AuthGuard } from '../guards/auth/auth.guard';
import { RoleGuard } from '../guards/role/role.guard';
import { Roles } from '../decorators/role.decorator';
import { UserRole } from '@myapp/database';
import { currentUser } from '../decorators/current-user.decorator';
import { User } from '@myapp/database';
import { NewsFetchLogRepository } from '@myapp/database';
import { UpdateArticleDto } from './dtos/update-article.dto';
import {
  ApiBody,
  ApiCookieAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { NewsQueueService } from './news.queue.service';
import { ViewLimitGuard } from '../guards/view-limit-guard/view-limit-guard';
import { FetchLimitGuard } from '../guards/fetch-limit/fetch-limit.guard';

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private newsQueueService: NewsQueueService,
    private newsFetchLogRepository: NewsFetchLogRepository,
  ) {}

  // @Get('test-fetch')
  // async testFetch(){
  //   return this.newsFetcherService.fetchAndStoreNews('technology', 2);
  // }
  
  @ApiOperation({
    summary:
      'Triggered an on-demand news refresh from external API (Admin only)',
  })
  @ApiCookieAuth('accessToken')
  @ApiBody({ schema: { example: { query: 'technology', number: 5 } } })
  @ApiResponse({
    status: 200,
    description: 'Refresh completed, return fetched cound',
  })
  @ApiResponse({ status: 403, description: 'Admin role reuire' })
  @Post('refresh')
  @UseGuards(AuthGuard, RoleGuard, FetchLimitGuard)
  @Roles([UserRole.ADMIN])
  async refreshNes(
    @Body() dto: { query: string; number?: number },
    @currentUser() admin: User,
    @Req() request: any,
  ) {
    const requestNumber = dto.number ?? 5;
    const remaining = request.remainingFetchLimit;
    const numberToFetch = remaining === null ? requestNumber: Math.min(requestNumber, remaining);
    const { jobId } = await this.newsQueueService.queueNewsFetch(
      dto.query,
      numberToFetch,
      admin.id,
    );

    return {
      status: 202,
      jobId,
      message: 'your request is pending please wait while',
    };
  }

  @Get('failed-jobs')
  async getFailedJobs() {
    return this.newsQueueService.getFailedJobs();
  }

  @Get('/retry-job/:jobId')
  async retryJob(@Param('jobId') jobId: string) {
    return this.newsQueueService.retryFaildJob(jobId);
  }

  @ApiOperation({
    summary: 'Check the status of a queued news-fetch job',
    description:
      'Returns the current state of a BullMQ job — waiting, active, completed, or failed. Use this to poll after triggering a news fetch.',
  })
  @ApiParam({
    name: 'jobId',
    description: 'The BullMQ job ID returned when the fetch was triggered',
    example: '5',
  })
  @ApiOkResponse({
    description: 'Job status retrieved successfully',
  })
  @ApiNotFoundResponse({
    description: 'Job not found (invalid ID or already expired/cleaned up)',
  })
  @ApiCookieAuth('accessToken')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles([UserRole.ADMIN])
  @Get('job-status/:jobId')
  async getJobStatus(@Param('jobId') jobId: string) {
    return this.newsQueueService.getJobState(jobId);
  }

  @ApiOperation({ summary: 'Get recent news fetch history (admin only)' })
  @ApiCookieAuth('accessToken')
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Fetch history return' })
  @ApiResponse({ status: 403, description: 'Admin role require' })
  @Get('fetch-history')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles([UserRole.ADMIN])
  async fetchHistory(@Query('limit') limit: number) {
    return this.newsFetchLogRepository.findRecent(Number(limit));
  }

  @ApiOperation({
    summary: 'Get news fetch statistic for the last 7 days (admin only)',
  })
  @ApiCookieAuth('accessToken')
  @ApiResponse({
    status: 200,
    description: 'Stats returned (total, failed, success rate, avg duration)',
  })
  @ApiResponse({ status: 403, description: 'Admin role require' })
  @Get('fetch-stats')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles([UserRole.ADMIN])
  async fetchStats() {
    const sinceDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return this.newsFetchLogRepository.getStats(sinceDate);
  }

  @ApiOperation({ summary: 'Get pagineted list of news article' })
  @ApiCookieAuth('accessToken')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Article return' })
  @Get()
  @UseGuards(AuthGuard, ViewLimitGuard)
  async findAll(
    @currentUser() currentUser: { id: string },
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('category') category?: string,
  ) {
    return this.newsService.findAll(currentUser.id,Number(page), Number(limit), category);
  }

  @ApiOperation({ summary: 'Delete an article by id (admin only)' })
  @ApiCookieAuth('accessToken')
  @ApiQuery({ name: 'id', description: 'Article id' })
  @ApiResponse({ status: 200, description: 'Article deleted' })
  @ApiResponse({ status: 403, description: 'Admin role require' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  @Delete(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles([UserRole.ADMIN])
  async remove(@Param('id') id: string) {
    const deleteArticle = await this.newsService.remove(id);
    return { message: 'Article deleted', deleteArticle };
  }

  @ApiOperation({ summary: 'Update article by id (admin only)' })
  @ApiCookieAuth('accessToken')
  @ApiQuery({ name: 'id', description: 'Article id' })
  @ApiResponse({ status: 200, description: 'Article updated' })
  @ApiResponse({ status: 403, description: 'Admin role require' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  @Patch(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles([UserRole.ADMIN])
  async updateArticle(@Param('id') id: string, @Body() dto: UpdateArticleDto) {
    return this.newsService.update(id, dto);
  }
}
