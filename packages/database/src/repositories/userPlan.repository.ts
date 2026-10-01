import { InjectRepository } from '@nestjs/typeorm';
import { BaseInterfaceRepository } from '../common/base.interface';
import { BaseAbstractRepostitory } from '../common/base.repository';
import { UserPlan } from '../entities/userPlan.entity';
import { Repository } from 'typeorm';
import { UserPlanEnum } from '../enums/user-plan.enum';
import { UserPlanInterface } from '../interfaces/userPlan.Interface';
import { User } from '../entities/user.entity';
import { Plans_catalog } from '../entities/plans.entity';

export class UserPlanRepository
  extends BaseAbstractRepostitory<UserPlan>
  implements UserPlanInterface
{
  constructor(
    @InjectRepository(UserPlan)
    private readonly userPlanRepository: Repository<UserPlan>,
  ) {
    super(userPlanRepository);
  }
  async createPlan(userId: string, planId: string): Promise<UserPlan> {
    const userPlan = this.userPlanRepository.create({
      user_id: userId,
      plan: { id: planId } as Plans_catalog,
      plan_upgraded_at: null,
    });
    return this.userPlanRepository.save(userPlan);
  }

  async findByUserId(userId: string): Promise<UserPlan | null> {
    try {
      const userplan = await this.userPlanRepository.findOne({
        where: { user_id: userId },
        relations: {plan: true}
      });
      return userplan;
    } catch (error) {
      console.log(error);
    }
  }

  async upgradeToPaid(userId: string, planId: string): Promise<void> {
    await this.userPlanRepository.update(
      { user_id: userId },
      { plan: { id: planId } as Plans_catalog, plan_upgraded_at: new Date() },
    );
  }
}
