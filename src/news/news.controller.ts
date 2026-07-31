import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsFetcherService } from './news-fetcher.service';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { RoleGuard } from 'src/guards/role/role.guard';
import { Roles } from 'src/decorators/role.decorator';
import { UserRole } from 'src/users/enums/user-role.enum';
import { currentUser } from 'src/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { NewsFetchLogRepository } from './news-fetch-log.repository';

@Controller('news')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private newsFetcherService: NewsFetcherService,
    private newsFetchLogRepository : NewsFetchLogRepository
  ) {}

  // @Get('test-fetch')
  // async testFetch(){
  //   return this.newsFetcherService.fetchAndStoreNews('technology', 2);
  // }
  @Post('refresh')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles([UserRole.ADMIN])
  async refreshNes(
    @Body() dto: { query: string; number?: number },
    @currentUser() admin: User,
  ) {
    return this.newsFetcherService.fetchAndStoreNews(
      dto.query,
      dto.number ?? 5,
      admin.id,
    );
  }

  @Get('fetch-history')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles([UserRole.ADMIN])
  async fetchHistory(@Query('limit') limit: number){
    return this.newsFetchLogRepository.findRecent(Number(limit));
  }

  @Get('fetch-stats')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles([UserRole.ADMIN])
  async fetchStats() {
    const sinceDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return this.newsFetchLogRepository.getStats(sinceDate);
  }

  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('category') category?: string,
  ) {
    return this.newsService.findAll(Number(page), Number(limit), category);
  }
}
