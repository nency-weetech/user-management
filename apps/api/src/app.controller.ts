import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { type Cache } from 'cache-manager';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService, @Inject(CACHE_MANAGER) private cacheManager : Cache) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

   @Get('redis-test')
  async testRedis() {
    await this.cacheManager.set('test-key', 'Hello Redis!', 60000);
    const value = await this.cacheManager.get('test-key');
    return { value };
  }
}
