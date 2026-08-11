import { redisConnection } from '@myapp/shared';
import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Global()
@Module({
  imports: [
    ConfigModule,
    BullModule.forRoot({
      connection: redisConnection,
    }),
  ],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (config: ConfigService) => {
        return new Redis({
          host: config.get('REDIS_HOST'),
          port: config.get('REDIS_PORT'),
          db: config.get('REDIS_DB') || 0,
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['REDIS_CLIENT', BullModule],
})
export class RedisModule {}
