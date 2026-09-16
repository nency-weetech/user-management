import { InjectRepository } from '@nestjs/typeorm';
import { BaseInterfaceRepository } from '../common/base.interface';
import { BaseAbstractRepostitory } from '../common/base.repository';
import { UserPlan } from '../entities/userPlan.entity';
import { Repository } from 'typeorm';
import { UserPlanEnum } from '../enums/user-plan.enum';
import { UserPlanInterface } from '../interfaces/userPlan.Interface';
import { User } from '../entities/user.entity';

export class UserPlanRepository extends BaseAbstractRepostitory<UserPlan> implements UserPlanInterface{
  constructor(
    @InjectRepository(UserPlan)
    private readonly userPlanRepository: Repository<UserPlan>,
  ) {
    super(userPlanRepository);
  }
  async createPlan(userId: string, plan: UserPlanEnum): Promise<UserPlan> {
    const userPlan = this.userPlanRepository.create({
      user_id: userId,
      plan,
      plan_upgraded_at: null,
    });
    return this.userPlanRepository.save(userPlan);
  }

  async findByUserId(userId: string): Promise<UserPlan | null> {
   try {
     const userplan = await this.userPlanRepository.findOne({where: {user_id : userId}});
     return userplan
   } catch (error) {
      console.log(error)
   }
  }

  async upgradeToPaid(userId: string,plan : UserPlanEnum): Promise<void> {
    await this.userPlanRepository.update(
      { user_id : userId},
      { plan: plan, plan_upgraded_at: new Date() },
    );
  }
}
