import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@myapp/database';
import { MailModule } from '../mail/mail.module';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { UserRepository } from '@myapp/database';

@Module({
  imports: [TypeOrmModule.forFeature([User]), ActivityLogModule],
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
  exports: [UsersService]
})
export class UsersModule {}
