import { BaseAbstractRepostitory } from '../common/base.repository';
import { OrganizationPlan } from '../entities/organization.plan.entity';
import { IOrganizationPlan } from '../interfaces/organizationPlan.interface';
import { Repository } from 'typeorm';
export declare class OrganizationPlanRepository extends BaseAbstractRepostitory<OrganizationPlan> implements IOrganizationPlan {
    private readonly orgPlanRepo;
    constructor(orgPlanRepo: Repository<OrganizationPlan>);
    createOrgPlan(organizationId: string, planId: string): Promise<OrganizationPlan>;
    findByOrgId(organizationId: string): Promise<OrganizationPlan | null>;
    upgradeToPlan(organizationId: string, planId: string): Promise<void>;
}
