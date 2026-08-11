import { Module } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { RedisModule } from '@nestjs-modules/ioredis';

@Module({
  imports:[RedisModule],
  providers: [ActivityLogService],
  exports: [ActivityLogService]
})
export class ActivityLogModule {}
