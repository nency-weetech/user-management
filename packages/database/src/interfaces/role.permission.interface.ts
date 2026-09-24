import { BaseInterfaceRepository } from "../common/base.interface";
import { RolePermissions } from "../entities/role.permission.entity";

export interface IRolePermission extends BaseInterfaceRepository<RolePermissions>{
    linkPermission(role_id: string, permission_id: string): Promise<RolePermissions>;
    findByRoleId(role_id: string): Promise<RolePermissions[]>
}