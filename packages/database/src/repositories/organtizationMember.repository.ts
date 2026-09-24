import { InjectRepository } from '@nestjs/typeorm';
import { BaseAbstractRepostitory } from '../common/base.repository';
import { OrganizationMembers } from '../entities/organizationMember.entity';
import { IOrganizationMember } from '../interfaces/organizationMember.interface';
import { Repository } from 'typeorm';
import { Organizations } from '../entities/organization.entity';
import { User } from '../entities/user.entity';

export class OrganizationMembersRepository
  extends BaseAbstractRepostitory<OrganizationMembers>
  implements IOrganizationMember
{
  constructor(
    @InjectRepository(OrganizationMembers)
    private readonly orgMemRepo: Repository<OrganizationMembers>,
  ) {
    super(orgMemRepo);
  }

  async createOrgMember(
    orgId: string,
    userId: string,
  ): Promise<OrganizationMembers> {
    const member = this.orgMemRepo.create({
      organization: { id: orgId } as Organizations,
      user: { id: userId } as User,
      joined_at: new Date(),
    });
    return this.orgMemRepo.save(member);
  }

  async findByUserId(userId: string): Promise<OrganizationMembers[]> {
    return this.orgMemRepo.find({ where: { user_id: userId } });
  }

  async findUserByOrg(
    orgId: string,
    userId: string,
  ): Promise<OrganizationMembers | null> {
    return this.orgMemRepo.findOne({
      where: { organization_id: orgId, user_id: userId },
    });
  }

  async findMemberByorg(orgId: string, memberId: string): Promise<OrganizationMembers | null>{
        return this.orgMemRepo.findOne({
      where: { organization_id: orgId, id: memberId },
    });
  }

  async findAllByOrgId(orgId: string) {
    return this.orgMemRepo.find({
      where: {
        organization_id: orgId,
      },
      relations: {
        user: true,
        organization: true
      },
      order: {
        joined_at: 'ASC',
      },
    });
  }

  async isMember(userId: string, orgId: string): Promise<boolean>{
    const count = await this.orgMemRepo.count({
      where: {
        organization_id: orgId,
        user_id : userId
      }
    });
    return count > 0
  }
}
