import { BaseAbstractRepostitory } from '../common/base.repository';
import { MemberRoles } from '../entities/member.role.entity';
import { IMemberRole } from '../interfaces/member.role.interface';
import { Repository } from 'typeorm';
export declare class MemberRoleRepository extends BaseAbstractRepostitory<MemberRoles> implements IMemberRole {
    private readonly memberRoleRepo;
    constructor(memberRoleRepo: Repository<MemberRoles>);
    assignRole(organizationMemberId: string, roleId: string): Promise<MemberRoles>;
    findByMemberId(organizationMemberId: string): Promise<MemberRoles[]>;
    isRoleAssigned(organizationMemberId: string, roleId: string): Promise<boolean>;
}
