import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { datasourceOptions } from './config/data-source';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { MailService } from './mail/mail.service';
import { MailModule } from './mail/mail.module';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { RateLimitService } from './rate-limit/rate-limit.service';
import { RateLimitModule } from './rate-limit/rate-limit.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config : ConfigService) => ({
        stores : [
          createKeyv(`redis://${config.get('REDIS_HOST')}:${config.get('REDIS_PORT')}`)
        ],
        ttl: 60 * 1000,
      })
    }),
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
    MailModule,
    RateLimitModule,
  ],
  controllers: [AppController],
  providers: [AppService, MailService, RateLimitService],
})
export class AppModule {}
