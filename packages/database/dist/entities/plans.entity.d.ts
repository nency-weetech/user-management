import { PlanTargetType } from "../enums/plan-target-type.enum";
import { PlanType } from "../enums/plan.enum";
export declare class Plans_catalog {
    id: string;
    target_type: PlanTargetType;
    name: PlanType;
    price: number;
    currency: string;
    daily_view_limit: number | null;
    daily_fetch_limit: number | null;
    profile_limit: number | null;
    bookmark_limit: number | null;
    created_at: Date;
    updated_at: Date;
}
