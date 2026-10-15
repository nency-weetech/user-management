import { Organizations } from './organization.entity';
import { Plans_catalog } from './plans.entity';
export declare class OrganizationPlan {
    id: string;
    organization_id: string;
    organization: Organizations;
    plan: Plans_catalog;
    plan_id: string;
    plan_upgraded_at: Date;
    created_at: Date;
    updated_at: Date;
}
