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
  constructor(@InjectRepository(OrganizationMembers) private readonly orgMemRepo: Repository<OrganizationMembers>) {
    super(orgMemRepo)
  }

  async createOrgMember(orgId: string, userId: string): Promise<OrganizationMembers> {
      const member = this.orgMemRepo.create({
        organization: {id: orgId}as Organizations,
        user: {id: userId}as User,
        joined_at: new Date()
      });
      return this.orgMemRepo.save(member);
  }

  async findByUserId(userId: string): Promise<OrganizationMembers[]> {
      return this.orgMemRepo.find({ where: {user_id: userId}});
  }
}
