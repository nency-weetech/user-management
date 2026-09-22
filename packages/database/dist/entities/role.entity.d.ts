import { Organizations } from "./organization.entity";
export declare class Roles {
    id: string;
    organization_id: string;
    organization: Organizations;
    name: string;
    is_default: boolean;
    created_at: Date;
}
