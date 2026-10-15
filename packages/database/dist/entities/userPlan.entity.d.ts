import { User } from './user.entity';
import { Plans_catalog } from './plans.entity';
export declare class UserPlan {
    id: string;
    user_id: string | null;
    user: User | null;
    plan: Plans_catalog;
    plan_id: string;
    plan_upgraded_at: Date;
    created_at: Date;
    updated_at: Date;
}
