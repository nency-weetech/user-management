import { BaseAbstractRepostitory } from '../common/base.repository';
import { Permissions } from '../entities/permission.entity';
import { IPermission } from '../interfaces/permission.interface';
import { Repository } from 'typeorm';
export declare class PermissionRepository extends BaseAbstractRepostitory<Permissions> implements IPermission {
    private readonly permissionRepo;
    constructor(permissionRepo: Repository<Permissions>);
    findAllPermission(): Promise<Permissions[]>;
    findByName(name: string): Promise<Permissions>;
    findByIds(ids: string[]): Promise<Permissions[]>;
}
