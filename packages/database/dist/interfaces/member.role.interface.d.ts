import { BaseInterfaceRepository } from "../common/base.interface";
import { MemberRoles } from "../entities/member.role.entity";
export interface IMemberRole extends BaseInterfaceRepository<MemberRoles> {
    assignRole(organizationMemberId: string, roleId: string): Promise<MemberRoles>;
    findByMemberId(organizationMemberId: string): Promise<MemberRoles[]>;
    isRoleAssigned(organizationMemberId: string, roleId: string): Promise<boolean>;
}
