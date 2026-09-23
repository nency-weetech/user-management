import { Organizations } from './organization.entity';
import { OrganizationPlanEnum } from '../enums/organization.plan.enum';
export declare class OrganizationPlan {
    id: string;
    organization_id: string;
    organization: Organizations;
    plan: OrganizationPlanEnum;
    plan_upgraded_at: Date;
    created_at: Date;
    updated_at: Date;
}
