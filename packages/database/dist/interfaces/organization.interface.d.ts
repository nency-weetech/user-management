import { BaseInterfaceRepository } from "../common/base.interface";
import { Organizations } from "../entities/organization.entity";
export interface IOrganization extends BaseInterfaceRepository<Organizations> {
    createOrganization(userId: string, name: string, isDefault: boolean): Promise<Organizations>;
    findDefaultByUserId(userId: string): Promise<Organizations | null>;
}
