import { InjectRepository } from "@nestjs/typeorm";
import { BaseAbstractRepostitory } from "../common/base.repository";
import { OrganizationPlan } from "../entities/organization.plan.entity";
import { IOrganizationPlan } from "../interfaces/organizationPlan.interface";
import { Repository } from "typeorm";
import { OrganizationPlanEnum } from "../enums/organization.plan.enum";
import { Organizations } from "../entities/organization.entity";

export class OrganizationPlanRepository extends BaseAbstractRepostitory<OrganizationPlan> implements IOrganizationPlan{
    constructor(@InjectRepository(OrganizationPlan) private readonly orgPlanRepo: Repository<OrganizationPlan>){
        super(orgPlanRepo)
    }

    async createOrgPlan(organizationId: string, plan: OrganizationPlanEnum): Promise<OrganizationPlan> {
        const orgPlan = this.orgPlanRepo.create({
            organization: {id : organizationId} as Organizations,
            plan
        })
        return this.orgPlanRepo.save(orgPlan);
    }

    async findByOrgId(organizationId: string): Promise<OrganizationPlan | null> {
        return this.orgPlanRepo.findOne({where: {organization_id: organizationId}})
    }

    async upgradeToPlan(organizationId: string, plan: OrganizationPlanEnum): Promise<void> {
        await this.orgPlanRepo.update(
            {organization_id : organizationId},
            {plan, plan_upgraded_at: new Date()},
        )
    }
}