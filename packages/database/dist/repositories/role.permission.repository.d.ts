import { BaseAbstractRepostitory } from '../common/base.repository';
import { RolePermissions } from '../entities/role.permission.entity';
import { IRolePermission } from '../interfaces/role.permission.interface';
import { Repository } from 'typeorm';
export declare class RolePermissionRepository extends BaseAbstractRepostitory<RolePermissions> implements IRolePermission {
    private readonly rolePermissionRepo;
    constructor(rolePermissionRepo: Repository<RolePermissions>);
    linkPermission(role_id: string, permission_id: string): Promise<RolePermissions>;
    findByRoleId(role_id: string): Promise<RolePermissions[]>;
}
