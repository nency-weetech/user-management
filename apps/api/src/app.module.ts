import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { datasourceOptions } from '@myapp/database';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from './mail/mail.module';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { RateLimitService } from './rate-limit/rate-limit.service';
import { RateLimitModule } from './rate-limit/rate-limit.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { RedisModule } from './redis/redis.module';
import { SignUpCountService } from './sign-up-count/sign-up-count.service';
import { ScheduleModule } from '@nestjs/schedule';
import { SoftDeleteService } from './soft-delete/soft-delete.service';
import { DeletionListenerService } from './soft-delete/deletion-listener.service';
import { DeletionCleanupService } from './soft-delete/deletion-cleanup.service';
import { SoftDeleteModule } from './soft-delete/soft-delete.module';
import { NewsModule } from './news/news.module';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';

const disableThrottler =
  process.env.NODE_ENV === 'test' && process.env.DISABLE_THROTTLER !== 'false';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath : '../../.env'
    }),
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter
    }),
    ScheduleModule.forRoot(),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        stores: [
          createKeyv(
            `redis://${config.get('REDIS_HOST')}:${config.get('REDIS_PORT')}/${config.get('REDIS_DB') || 0}`,
          ),
        ],
        ttl: 60 * 1000,
      }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 15,
      },
    ]),
    TypeOrmModule.forRoot(datasourceOptions),

    JwtModule.register({
      global: true,
      secret: process.env.ACCESS_JWT_SECRET,
      signOptions: {
        expiresIn: '1h',
      },
    }),
    UsersModule,
    AuthModule,
    RedisModule as any,
    MailModule,
    RateLimitModule,
    ActivityLogModule,
    SoftDeleteModule,
    NewsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RateLimitService,
    // ...(process.env.NODE_ENV !== 'test'
    // ? [{ provide: APP_GUARD, useClass: ThrottlerGuard }]
    // : []),
    // { provide: APP_GUARD, useClass: ThrottlerGuard },
    ...(!disableThrottler
      ? [{ provide: APP_GUARD, useClass: ThrottlerGuard }]
      : []),
    SignUpCountService,
    SoftDeleteService,
    DeletionListenerService,
    DeletionCleanupService,
  ],
})
export class AppModule {}
