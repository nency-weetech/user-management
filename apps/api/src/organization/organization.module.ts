import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  MemberRoleRepository,
  MemberRoles,
  OrganizationMembers,
  OrganizationMembersRepository,
  OrganizationRepository,
  Organizations,
  PermissionRepository,
  Permissions,
  RolePermissionRepository,
  RolePermissions,
  RoleRepository,
  Roles,
  User,
  UserRepository,
} from '@myapp/database';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrganizationMembers,
      Organizations,
      User,
      Permissions,
      Roles,
      RolePermissions,
      MemberRoles,
      Permissions
    ]),
    MailModule,
  ],
  controllers: [OrganizationController],
  providers: [
    OrganizationService,
    OrganizationRepository,
    OrganizationMembersRepository,
    UserRepository,
    PermissionRepository,
    RoleRepository,
    RolePermissionRepository,
    MemberRoleRepository,
    PermissionRepository,
  ],
  exports: [OrganizationService]
})
export class OrganizationModule {}
