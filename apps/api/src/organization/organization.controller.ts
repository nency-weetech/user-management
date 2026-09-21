import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { AuthGuard } from '../guards/auth/auth.guard';
import { Request } from 'express';
import { InviteMemberDto } from './dto/invite.member.dto';

@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post(':id/invite')
  @UseGuards(AuthGuard)
  async inviteMember(
    @Param('id') orgId: string,
    @Body() dto: InviteMemberDto,
    @Req() req,
  ){
    return this.organizationService.inviteMember(orgId, dto.email, req.user.id)
  }

  @Get(':id/members')
  @UseGuards(AuthGuard)
  async findAllMembersOfOrg(
    @Param('id') orgId: string,
    @Req() req,
  ){
    return this.organizationService.findAllMemberOfOrg(orgId, req.user.id)
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
