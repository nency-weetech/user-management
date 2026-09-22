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
  OrganizationRepository,
  Organizations,
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
  ],
})
export class BookmarkModule {}
