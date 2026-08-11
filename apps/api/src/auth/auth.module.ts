import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from '../mail/mail.module';
import { RateLimitModule } from '../rate-limit/rate-limit.module';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { SignUpCountService } from '../sign-up-count/sign-up-count.service';
import { SoftDeleteService } from '../soft-delete/soft-delete.service';

@Module({
  imports: [UsersModule, MailModule, RateLimitModule, ActivityLogModule],
  providers: [AuthService, SignUpCountService, SoftDeleteService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
