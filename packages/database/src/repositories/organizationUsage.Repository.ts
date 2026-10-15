import { InjectRepository } from '@nestjs/typeorm';
import { BaseAbstractRepostitory } from '../common/base.repository';
import { OrganizationUsage } from '../entities/organizationUsage.entity';
import { IOrganizationUsage } from '../interfaces/organizationUsage.interface';
import { Repository } from 'typeorm';
import { Organizations } from '../entities/organization.entity';

export class OrganizationUsageRepository
  extends BaseAbstractRepostitory<OrganizationUsage>
  implements IOrganizationUsage
{
  constructor(
    @InjectRepository(OrganizationUsage)
    private readonly orgUsageRepo: Repository<OrganizationUsage>,
  ) {
    super(orgUsageRepo);
  }

  async createOrgUsage(organizationId: string): Promise<OrganizationUsage> {
    const orgUsage = this.orgUsageRepo.create({
      organization: { id: organizationId } as Organizations,
      daily_bookmark_count: 0,
      daily_bookmark_reset_at: null,
    });
    return this.orgUsageRepo.save(orgUsage);
  }

  async findByOrgId(organizationId: string): Promise<OrganizationUsage | null> {
    return this.orgUsageRepo.findOne({
      where: { organization_id: organizationId },
    });
  }

  async incrementBookmarkCount(
    organizationId: string,
    by: number,
  ): Promise<void> {
    await this.orgUsageRepo.increment(
      { organization_id: organizationId },
      'daily_bookmark_count',
      by,
    );
  }

  async resetDailyBookmarkCount(organizationId: string, resetDate: Date): Promise<void> {
      await this.orgUsageRepo.update(
        {organization_id: organizationId},
        {daily_bookmark_count: 0, daily_bookmark_reset_at: resetDate}
      )
  }
}
