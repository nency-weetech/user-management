import { InjectRepository } from '@nestjs/typeorm';
import { BaseAbstractRepostitory } from '../common/base.repository';
import { MemberRoles } from '../entities/member.role.entity';
import { IMemberRole } from '../interfaces/member.role.interface';
import { Repository } from 'typeorm';
import { OrganizationMembers } from '../entities/organizationMember.entity';
import { Roles } from '../entities/role.entity';

export class MemberRoleRepository
  extends BaseAbstractRepostitory<MemberRoles>
  implements IMemberRole
{
  constructor(
    @InjectRepository(MemberRoles)
    private readonly memberRoleRepo: Repository<MemberRoles>,
  ) {
    super(memberRoleRepo);
  }

  async assignRole(
    organizationMemberId: string,
    roleId: string,
  ): Promise<MemberRoles> {
    const memberRole = this.memberRoleRepo.create({
      organization_member: { id: organizationMemberId } as OrganizationMembers,
      roles: { id: roleId } as Roles,
    });

    const saved = await this.memberRoleRepo.save(memberRole);
    return this.memberRoleRepo.findOne({
      where: { id: saved.id },
      relations: { roles: true },
    });
  }

  async findByMemberId(organizationMemberId: string): Promise<MemberRoles[]> {
    return this.memberRoleRepo.find({
      where: { organization_member_id: organizationMemberId },
    });
  }

  async isRoleAssigned(
    organizationMemberId: string,
    roleId: string,
  ): Promise<boolean> {
    const count = await this.memberRoleRepo.count({
      where: { organization_member_id: organizationMemberId, role_id: roleId },
    });
    return count > 0;
  }
}
