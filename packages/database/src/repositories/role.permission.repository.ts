import { InjectRepository } from '@nestjs/typeorm';
import { BaseAbstractRepostitory } from '../common/base.repository';
import { RolePermissions } from '../entities/role.permission.entity';
import { IRolePermission } from '../interfaces/role.permission.interface';
import { Repository } from 'typeorm';
import { Roles } from '../entities/role.entity';
import { Permissions } from '../entities/permission.entity';

export class RolePermissionRepository
  extends BaseAbstractRepostitory<RolePermissions>
  implements IRolePermission
{
  constructor(
    @InjectRepository(RolePermissions)
    private readonly rolePermissionRepo: Repository<RolePermissions>,
  ) {
    super(rolePermissionRepo);
  }

  async linkPermission(
    role_id: string,
    permission_id: string,
  ): Promise<RolePermissions> {
    const link = this.rolePermissionRepo.create({
      role: { id: role_id } as Roles,
      permission: { id: permission_id } as Permissions,
    });
    return this.rolePermissionRepo.save(link);
  }

  async findByRoleId(role_id: string): Promise<RolePermissions[]> {
    return this.rolePermissionRepo.find({ 
        where: { role_id: role_id },
        relations: {permission: true}
     });
  }
}
