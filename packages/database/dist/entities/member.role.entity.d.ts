import { OrganizationMembers } from './organizationMember.entity';
import { Roles } from './role.entity';
export declare class MemberRoles {
    id: string;
    organization_member_id: string;
    organization_member: OrganizationMembers;
    role_id: string;
    roles: Roles;
    assigned_at: Date;
}
