import { BaseInterfaceRepository } from "../common/base.interface";
import { OrganizationPlan } from "../entities/organization.plan.entity";
import { OrganizationPlanEnum } from "../enums/organization.plan.enum";

export interface IOrganizationPlan extends BaseInterfaceRepository<OrganizationPlan>{
    createOrgPlan(organizationId: string, plan: OrganizationPlanEnum): Promise<OrganizationPlan>;
    findByOrgId(organizationId: string): Promise<OrganizationPlan| null>;
    upgradeToPlan(organizationId: string, plan: OrganizationPlanEnum): Promise<void>
}