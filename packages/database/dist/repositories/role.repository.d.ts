import { BaseAbstractRepostitory } from "../common/base.repository";
import { Roles } from "../entities/role.entity";
import { IRole } from "../interfaces/role.interface";
import { Repository } from "typeorm";
export declare class RoleRepository extends BaseAbstractRepostitory<Roles> implements IRole {
    private readonly roleRepo;
    constructor(roleRepo: Repository<Roles>);
    createRole(organization_id: string, name: string, is_default: boolean): Promise<Roles>;
    findByOrgId(organization_id: string): Promise<Roles[]>;
    findByIdAndOrg(id: string, organization_id: string): Promise<Roles>;
}
