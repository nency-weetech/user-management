import { Organizations } from "./organization.entity";
import { User } from "./user.entity";
export declare class OrganizationMembers {
    id: string;
    organization_id: string;
    organization: Organizations;
    user_id: string;
    user: User;
    joined_at: Date;
}
