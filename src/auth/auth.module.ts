import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from 'src/mail/mail.module';
import { RateLimitModule } from 'src/rate-limit/rate-limit.module';
import { ActivityLogModule } from 'src/activity-log/activity-log.module';
import { SignUpCountService } from 'src/sign-up-count/sign-up-count.service';
import { SoftDeleteService } from 'src/soft-delete/soft-delete.service';
import { AuthKeyclockService } from './auth.keyclock.service';
import { KeyclockStrategy } from './keyclock.strategy';
import { HttpModule } from '@nestjs/axios';
import { PassportModule } from '@nestjs/passport';
import { KeyclockAdminService } from './keyclock.admin.service';

@Module({
  imports: [UsersModule, MailModule, RateLimitModule, ActivityLogModule, HttpModule, PassportModule],
  providers: [AuthService, SignUpCountService, SoftDeleteService, AuthKeyclockService, KeyclockStrategy, KeyclockAdminService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
