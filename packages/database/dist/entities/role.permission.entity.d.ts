import { Roles } from "./role.entity";
import { Permissions } from "./permission.entity";
export declare class RolePermissions {
    id: string;
    role_id: string;
    role: Roles;
    permission_id: string;
    permission: Permissions;
}
