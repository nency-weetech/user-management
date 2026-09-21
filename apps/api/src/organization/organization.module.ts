import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationMembers, OrganizationMembersRepository, OrganizationRepository, Organizations, User, UserRepository } from '@myapp/database';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationMembers, Organizations, User]), MailModule],
  controllers: [OrganizationController],
  providers: [OrganizationService, OrganizationRepository, OrganizationMembersRepository, UserRepository],
})
export class OrganizationModule {}
