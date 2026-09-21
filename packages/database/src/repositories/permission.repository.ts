import { InjectRepository } from '@nestjs/typeorm';
import { BaseAbstractRepostitory } from '../common/base.repository';
import { Permissions } from '../entities/permission.entity';
import { IPermission } from '../interfaces/permission.interface';
import { FindManyOptions, Repository } from 'typeorm';

export class PermissionRepository
  extends BaseAbstractRepostitory<Permissions>
  implements IPermission
{
  constructor(
    @InjectRepository(Permissions)
    private readonly permissionRepo: Repository<Permissions>,
  ) {
    super(permissionRepo);
  }

  async findAllPermission(): Promise<Permissions[]> {
    return await this.permissionRepo.find();
  }

  async findByName(name: string): Promise<Permissions> {
    return this.permissionRepo.findOne({ where: { name: name } });
  }
}
