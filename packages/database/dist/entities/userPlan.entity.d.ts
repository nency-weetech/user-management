import { UserPlanEnum } from '../enums/user-plan.enum';
import { User } from './user.entity';
export declare class UserPlan {
    id: string;
    user_id: string | null;
    user: User | null;
    plan: UserPlanEnum;
    plan_upgraded_at: Date;
    created_at: Date;
    updated_at: Date;
}
