import { InjectRepository } from '@nestjs/typeorm';
import { BaseAbstractRepostitory } from '../common/base.repository';
import { Organizations } from '../entities/organization.entity';
import { IOrganization } from '../interfaces/organization.interface';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

export class OrganizationRepository
  extends BaseAbstractRepostitory<Organizations>
  implements IOrganization {
    constructor(@InjectRepository(Organizations) private readonly organizationRepo: Repository<Organizations>){
        super(organizationRepo);
    }

    async createOrganization(userId: string, name: string, isDefault: boolean): Promise<Organizations> {
        const org = this.organizationRepo.create({
            owner: {id: userId}as User,
            name,
            is_default: isDefault,
        });
        return this.organizationRepo.save(org);
    }

    async findDefaultByUserId(userId: string): Promise<Organizations | null> {
        return this.organizationRepo.findOne({where: {owner_id: userId, is_default: true}})
    }
  }
