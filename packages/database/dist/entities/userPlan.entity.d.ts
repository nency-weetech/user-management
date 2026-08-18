import { UserPlanEnum } from '../enums/user-plan.enum';
import { User } from './user.entity';
export declare class UserPlan {
    id: string;
    userId: string | null;
    user: User | null;
    plan: UserPlanEnum;
    planUpgradedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
