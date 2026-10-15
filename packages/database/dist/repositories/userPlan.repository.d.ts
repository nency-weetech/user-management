import { BaseAbstractRepostitory } from '../common/base.repository';
import { UserPlan } from '../entities/userPlan.entity';
import { Repository } from 'typeorm';
import { UserPlanInterface } from '../interfaces/userPlan.Interface';
export declare class UserPlanRepository extends BaseAbstractRepostitory<UserPlan> implements UserPlanInterface {
    private readonly userPlanRepository;
    constructor(userPlanRepository: Repository<UserPlan>);
    createPlan(userId: string, planId: string): Promise<UserPlan>;
    findByUserId(userId: string): Promise<UserPlan | null>;
    upgradeToPaid(userId: string, planId: string): Promise<void>;
}
