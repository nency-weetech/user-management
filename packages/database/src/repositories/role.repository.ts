import { InjectRepository } from "@nestjs/typeorm";
import { BaseAbstractRepostitory } from "../common/base.repository";
import { Roles } from "../entities/role.entity";
import { IRole } from "../interfaces/role.interface";
import { Repository } from "typeorm";
import { Organizations } from "../entities/organization.entity";

export class RoleRepository extends BaseAbstractRepostitory<Roles> implements IRole{
    constructor(@InjectRepository(Roles) private readonly roleRepo : Repository<Roles>){
        super(roleRepo)
    }

    async createRole(organization_id: string, name: string, is_default: boolean): Promise<Roles> {
        const role = this.roleRepo.create({
            organization: {id : organization_id} as Organizations,
            name,
            is_default: false
        })
        return this.roleRepo.save(role);
    }

    async findByOrgId(organization_id: string): Promise<Roles[]> {
        return this.roleRepo.find({where: {organization_id}})
    }

    async findByIdAndOrg(id: string, organization_id: string): Promise<Roles> {
        return this.roleRepo.findOne({where: {id, organization_id}})
    }
}