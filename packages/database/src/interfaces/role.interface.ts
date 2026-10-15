import { BaseInterfaceRepository } from "../common/base.interface";
import { Roles } from "../entities/role.entity";

export interface IRole extends BaseInterfaceRepository<Roles>{
    createRole(organization_id: string, name: string, is_default: boolean) : Promise<Roles>;
    findByOrgId(organization_id: string): Promise<Roles[]>;
    findByIdAndOrg(id: string, organization_id: string): Promise<Roles>;
}