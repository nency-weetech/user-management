import { BaseInterfaceRepository } from "../common/base.interface";
import { UserPlan } from "../entities/userPlan.entity";
import { UserPlanEnum } from "../enums/user-plan.enum";

export interface UserPlanInterface extends BaseInterfaceRepository<UserPlan>{
    createPlan(userId: string, plan: UserPlanEnum): Promise<UserPlan>;
    findByUserId(userId: string): Promise<UserPlan | null>;
    upgradeToPaid(userId: string, plan : UserPlanEnum): Promise<void>
}