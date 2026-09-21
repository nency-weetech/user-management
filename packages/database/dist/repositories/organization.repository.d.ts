import { BaseAbstractRepostitory } from '../common/base.repository';
import { Organizations } from '../entities/organization.entity';
import { IOrganization } from '../interfaces/organization.interface';
import { Repository } from 'typeorm';
export declare class OrganizationRepository extends BaseAbstractRepostitory<Organizations> implements IOrganization {
    private readonly organizationRepo;
    constructor(organizationRepo: Repository<Organizations>);
    createOrganization(userId: string, name: string, isDefault: boolean): Promise<Organizations>;
    findDefaultByUserId(userId: string): Promise<Organizations | null>;
}
