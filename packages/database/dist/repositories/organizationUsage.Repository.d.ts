import { BaseAbstractRepostitory } from '../common/base.repository';
import { OrganizationUsage } from '../entities/organizationUsage.entity';
import { IOrganizationUsage } from '../interfaces/organizationUsage.interface';
import { Repository } from 'typeorm';
export declare class OrganizationUsageRepository extends BaseAbstractRepostitory<OrganizationUsage> implements IOrganizationUsage {
    private readonly orgUsageRepo;
    constructor(orgUsageRepo: Repository<OrganizationUsage>);
    createOrgUsage(organizationId: string): Promise<OrganizationUsage>;
    findByOrgId(organizationId: string): Promise<OrganizationUsage | null>;
    incrementBookmarkCount(organizationId: string, by: number): Promise<void>;
    resetDailyBookmarkCount(organizationId: string, resetDate: Date): Promise<void>;
}
