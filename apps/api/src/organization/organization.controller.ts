import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { AuthGuard } from '../guards/auth/auth.guard';
import { Request } from 'express';
import { InviteMemberDto } from './dto/invite.member.dto';
import { PermissionRepository, User } from '@myapp/database';
import { currentUser } from '../decorators/current-user.decorator';

@Controller('organization')
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly permissionRepo: PermissionRepository,
  ) {}

  @Post(':id/invite')
  @UseGuards(AuthGuard)
  async inviteMember(
    @Param('id') orgId: string,
    @Body() dto: InviteMemberDto,
    @currentUser() user: User,
  ) {
    return this.organizationService.inviteMember(orgId, dto.email, user.id);
  }

  @Get(':id/members')
  @UseGuards(AuthGuard)
  async findAllMembersOfOrg(
    @Param('id') orgId: string,
    @currentUser() user: User,
  ) {
    return this.organizationService.findAllMemberOfOrg(orgId, user.id);
  }

  @Get('permissions')
  @UseGuards(AuthGuard)
  async allPermission() {
    return this.permissionRepo.findAllPermission();
  }

  @Get(':id/roles')
  @UseGuards(AuthGuard)
  async allRoles(@Param('id') orgId: string, @currentUser() user: User) {
    return this.organizationService.allRoleOfOrg(orgId, user.id);
  }

  @Get(':id/roles/:roleId')
  @UseGuards(AuthGuard)
  async findOneRole(
    @Param('id') orgId: string,
    @Param('roleId') roleId: string,
    @currentUser() user: User,
  ) {
    return this.organizationService.findOneRole(roleId, orgId, user.id);
  }

  @Post(':id/members/:memberId/roles')
  @UseGuards(AuthGuard)
  async assignRole(
    @Param('id') orgId: string,
    @Param('memberId') targetUserId: string,
    @Body() dto: { roleId: string },
    @currentUser() user: User,
  ) {
    return this.organizationService.assignRole(
      dto.roleId,
      targetUserId,
      orgId,
      user.id,
    );
  }

  @Post(':id/roles')
  @UseGuards(AuthGuard)
  async customRole(
    @Param('id') orgId: string,
    @Body() dto: { name: string; permissionIds: string[] },
    @currentUser() user: User,
  ) {
    return this.organizationService.createCustomRole(orgId, user.id, dto.name, dto.permissionIds);
  }
  // @Post()
  // create(@Body() createOrganizationDto: CreateOrganizationDto) {
  //   return this.organizationService.create(createOrganizationDto);
  // }

  // @Get()
  // findAll() {
  //   return this.organizationService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.organizationService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateOrganizationDto: UpdateOrganizationDto) {
  //   return this.organizationService.update(+id, updateOrganizationDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.organizationService.remove(+id);
  // }
}
