import { Module } from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { BookmarkController } from './bookmark.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BookmarkRepository,
  BookMarks,
  MemberRoleRepository,
  MemberRoles,
  OrganizationMembers,
  OrganizationMembersRepository,
  OrganizationPlan,
  OrganizationPlanRepository,
  OrganizationRepository,
  Organizations,
  OrganizationUsage,
  OrganizationUsageRepository,
  PermissionRepository,
  RolePermissionRepository,
  RolePermissions,
  UserPlan,
  UserPlanRepository,
  UserUsage,
  UserUsageRepository,
} from '@myapp/database';

import { OrganizationModule } from '../organization/organization.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      BookMarks,
      UserPlan,
      UserUsage,
      OrganizationMembers,
      Organizations,
      RolePermissions,
      MemberRoles,
      OrganizationUsage,
      OrganizationPlan
    ]),
    OrganizationModule
  ],
  controllers: [BookmarkController],
  providers: [
    BookmarkService,
    BookmarkRepository,
    UserPlanRepository,
    UserUsageRepository,
    OrganizationMembersRepository,
    OrganizationRepository,
    RolePermissionRepository,
    MemberRoleRepository,
    OrganizationUsageRepository,
    OrganizationPlanRepository
  ],
})
export class BookmarkModule {}
