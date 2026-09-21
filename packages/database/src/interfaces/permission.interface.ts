import { BaseInterfaceRepository } from "../common/base.interface";
import { Permissions } from "../entities/permission.entity";

export interface IPermission extends BaseInterfaceRepository<Permissions>{
    findAllPermission(): Promise<Permissions[]>;
    findByName(name : string): Promise<Permissions>;
}