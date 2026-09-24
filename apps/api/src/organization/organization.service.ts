import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import {
  MemberRoleRepository,
  OrganizationMembersRepository,
  OrganizationRepository,
  PermissionRepository,
  RolePermissionRepository,
  RoleRepository,
  UserRepository,
} from '@myapp/database';
import { MailService } from '../mail/mail.service';
import { permission } from 'process';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly orgRepo: OrganizationRepository,
    private readonly orgMemberRepo: OrganizationMembersRepository,
    private readonly roleRepo: RoleRepository,
    private readonly rolePermissionRepo: RolePermissionRepository,
    private readonly memberRoleRepo: MemberRoleRepository,
    private readonly permissionRepo: PermissionRepository,
    private readonly userRepo: UserRepository,
    private readonly mailService: MailService,
  ) {}
  // create(createOrganizationDto: CreateOrganizationDto) {
  //   return 'This action adds a new organization';
  // }

  // findAll() {
  //   return `This action returns all organization`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} organization`;
  // }

  // update(id: number, updateOrganizationDto: UpdateOrganizationDto) {
  //   return `This action updates a #${id} organization`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} organization`;
  // }

  async inviteMember(orgId: string, email: string, currentUserId: string) {
    const org = await this.orgRepo.findOneById(orgId);
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    const orgAdmin = await this.orgRepo.findIsAdmin(orgId, currentUserId);

    if (!orgAdmin) {
      throw new ForbiddenException(
        'Only organization admins can invite members',
      );
    }

    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new NotFoundException(
        'User must have an account before joining the organization',
      );
    }

    const existingMember = await this.orgMemberRepo.findUserByOrg(
      orgId,
      user.id,
    );
    if (existingMember) {
      throw new ConflictException(
        'User is already a member of this organization',
      );
    }

    const member = await this.orgMemberRepo.createOrgMember(orgId, user.id);

    await this.orgMemberRepo.save(member);
    await this.mailService.sendInvitationGreet(user.email, org.name);

    return {
      message: 'User added to organization successfully',
      memberId: member.id,
    };
  }

  async assignRole(
    roleId: string,
    targetUserId: string,
    orgId: string,
    requestingUserId: string,
  ) {
    const isOwner = await this.orgRepo.findIsAdmin(orgId, requestingUserId);
    if (!isOwner) {
      throw new ForbiddenException(
        'Only the organization owner can assign roles',
      );
    }

    const existMember = await this.orgMemberRepo.findMemberByorg(
      orgId,
      targetUserId,
    );
    if (!existMember) {
      throw new ForbiddenException('User is not a member of this organization');
    }

    const roleExist = await this.roleRepo.findByIdAndOrg(roleId, orgId);
    if (!roleExist) {
      throw new NotFoundException('Role does not exist in this organization');
    }

    const isAlreadyAssigned = await this.memberRoleRepo.isRoleAssigned(
      existMember.id,
      roleExist.id,
    );
    if (isAlreadyAssigned) {
      throw new ForbiddenException('Role already assigned to this member');
    }

    const memberRole = await this.memberRoleRepo.assignRole(
      existMember.id,
      roleExist.id,
    );
    return {
      memberId: existMember.id,
      userId: targetUserId,
      role: {
        id: roleExist.id,
        name: roleExist.name,
      },
      assignedAt: memberRole.assigned_at,
    };
  }

  async findAllMemberOfOrg(orgId: string, currentUserId: string) {
    const org = await this.orgRepo.findOneById(orgId);
    if (!org) {
      throw new NotFoundException('Organization not found');
    }
    const isOwner = await this.orgRepo.findIsAdmin(orgId, currentUserId);
    if (!isOwner) {
      throw new ForbiddenException('Only organization owner can view members');
    }
    const members = await this.orgMemberRepo.findAllByOrgId(orgId);
    const canRead = await this.hasPermission(
      orgId,
      currentUserId,
      'Bookmark.Read',
    );
    if (!canRead) {
      throw new ForbiddenException(
        'You do not have permission to view bookmarks in this organization',
      );
    }

    return {
      organizationId: orgId,
      members,
    };
  }

  async allRoleOfOrg(orgId: string, userId: string) {
    const isMember = await this.orgMemberRepo.findByUserId(userId);
    if (!isMember) {
      throw new ForbiddenException('User is not a member of this organization');
    }
    const roles = await this.roleRepo.findByOrgId(orgId);
    const roleWithPermission = await Promise.all(
      roles.map(async (role) => {
        const rolePermission = await this.rolePermissionRepo.findByRoleId(
          role.id,
        );
        return {
          id: role.id,
          name: role.name,
          is_default: role.is_default,
          permissions: rolePermission.map((rp) => rp.permission.name),
        };
      }),
    );
    return roleWithPermission;
  }

  async findOneRole(roleId: string, orgId: string, userId: string) {
    const isMember = await this.orgMemberRepo.findByUserId(userId);
    if (!isMember) {
      throw new ForbiddenException('User is not a member of this organization');
    }
    const role = await this.roleRepo.findByIdAndOrg(roleId, orgId);

    const roleWithPermission = await this.rolePermissionRepo.findByRoleId(
      role.id,
    );

    return {
      id: role.id,
      name: role.name,
      is_default: role.is_default,
      permissions: roleWithPermission.map((rp) => rp.permission),
    };
  }

  async createCustomRole(
    orgId: string,
    requestingUserId,
    name: string,
    permissionIds: string[],
  ) {
    const isOwner = await this.orgRepo.findIsAdmin(orgId, requestingUserId);
    if (!isOwner) {
      throw new ForbiddenException(
        'Only the organization owner can assign roles',
      );
    }

    if (!permissionIds || permissionIds.length === 0) {
      throw new BadRequestException('At least one permission is required');
    }

    const validatePermission =
      await this.permissionRepo.findByIds(permissionIds);
    if (validatePermission.length !== permissionIds.length) {
      throw new BadRequestException('One or more permission IDs are invalid');
    }

    const newRole = await this.roleRepo.createRole(orgId, name, false);
    const rolePermission = await Promise.all(
      permissionIds.map((permissionId) =>
        this.rolePermissionRepo.linkPermission(newRole.id, permissionId),
      ),
    );

    return {
      id: newRole.id,
      name: newRole.name,
      is_default: newRole.is_default,
      permissions: validatePermission.map((p) => p.name),
    };
  }

  async hasPermission(
    organizationId: string,
    userId: string,
    permissionName: string,
  ): Promise<boolean> {
    const member = await this.orgMemberRepo.findUserByOrg(organizationId, userId );
    if (!member) {
      return false;
    }

    const memberRoles = await this.memberRoleRepo.findByMemberId(member.id);
    if (memberRoles.length === 0) {
      return false;
    }

    for (const memberRole of memberRoles) {
      const rolePermissions = await this.rolePermissionRepo.findByRoleId(
        memberRole.role_id,
      );
      const hasIt = rolePermissions.some(
        (rp) => rp.permission.name === permissionName,
      );
      if (hasIt) {
        return true;
      }
    }

    return false;
  }
}
