import {
  UserPlanEnum,
  UserPlanRepository,
  UserUsageRepository,
} from '@myapp/database';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ViewLimitGuard implements CanActivate {
  constructor(
    private userPlanRepo: UserPlanRepository,
    private userUsageRepo: UserUsageRepository,
  ) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const { user } = request;
    if (!user) {
      throw new NotFoundException('User Not exists');
    }

    const userPlan = await this.userPlanRepo.findByUserId(user.id);
    if (!userPlan) {
      throw new NotFoundException('User plan not found');
    }

    if (userPlan.plan === UserPlanEnum.MAX) {
      return true;
    }

    const dailyLimit = userPlan.plan === UserPlanEnum.PRO ? 100 : 20;
    console.log(dailyLimit);
    const userUsage = await this.userUsageRepo.findByUserId(user.id);
    if (!userUsage) {
      throw new NotFoundException('User usage not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const resetAt = userUsage.dailyArticleViewResetAt
      ? new Date(userUsage.dailyArticleViewResetAt)
      : null;

    const sameDay =
      resetAt !== null &&
      resetAt.getFullYear() === today.getFullYear() &&
      resetAt.getMonth() === today.getMonth() &&
      resetAt.getDate() === today.getDate();

    let currentCount;

    if (!sameDay) {
      await this.userUsageRepo.resetDailyCount(user.id, today);
      currentCount = 0;
    } else {
      currentCount = userUsage.dailyArticleViewCount;
    }

    if (currentCount >= dailyLimit) {
      throw new ForbiddenException(
        'Daily View limit Reached, Upgrad plan for unlimited access.',
      );
    }

    request.remainingViewLimit = dailyLimit - currentCount;
    return true;
  } 
}
