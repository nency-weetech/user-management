import { BaseInterfaceRepository } from "../common/base.interface";
import { OrganizationUsage } from "../entities/organizationUsage.entity";
export interface IOrganizationUsage extends BaseInterfaceRepository<OrganizationUsage> {
    createOrgUsage(organizationId: string): Promise<OrganizationUsage>;
    findByOrgId(organizationId: string): Promise<OrganizationUsage | null>;
    incrementBookmarkCount(organizationId: string, by: number): Promise<void>;
    resetDailyBookmarkCount(organizationId: string, resetDate: Date): Promise<void>;
}
