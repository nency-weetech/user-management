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
import { ProfileModule } from '../profile/profile.module';
import { RefreshToken, RefreshTokenRepository } from '@myapp/database';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([RefreshToken]),UsersModule, MailModule, RateLimitModule, ActivityLogModule, ProfileModule],
  providers: [AuthService, SignUpCountService, SoftDeleteService, RefreshTokenRepository],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
