import { BaseInterfaceRepository } from "../common/base.interface";
import { OrganizationMembers } from "../entities/organizationMember.entity";
export interface IOrganizationMember extends BaseInterfaceRepository<OrganizationMembers> {
    createOrgMember(orgId: string, userId: string): Promise<OrganizationMembers>;
    findByUserId(userId: string): Promise<OrganizationMembers[]>;
}
