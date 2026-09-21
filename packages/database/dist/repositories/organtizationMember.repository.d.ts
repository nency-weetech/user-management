import { BaseAbstractRepostitory } from '../common/base.repository';
import { OrganizationMembers } from '../entities/organizationMember.entity';
import { IOrganizationMember } from '../interfaces/organizationMember.interface';
import { Repository } from 'typeorm';
export declare class OrganizationMembersRepository extends BaseAbstractRepostitory<OrganizationMembers> implements IOrganizationMember {
    private readonly orgMemRepo;
    constructor(orgMemRepo: Repository<OrganizationMembers>);
    createOrgMember(orgId: string, userId: string): Promise<OrganizationMembers>;
    findByUserId(userId: string): Promise<OrganizationMembers[]>;
}
