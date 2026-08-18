import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  User,
  UserPlan,
  UserUsage,
  UserPlanRepository,
  UserUsageRepository,
} from '@myapp/database';
import { MailModule } from '../mail/mail.module';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { UserRepository } from '@myapp/database';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserPlan, UserUsage]),
    ActivityLogModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserRepository,
    UserPlanRepository,
    UserUsageRepository,
  ],
  exports: [
    UsersService,
    UserRepository,
    UserPlanRepository,
    UserUsageRepository,
  ],
})
export class UsersModule {}
