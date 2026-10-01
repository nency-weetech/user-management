import {
  NewsFetchLogRepository,
  UserPlanRepository,
} from '@myapp/database';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class FetchLimitGuard implements CanActivate {
  constructor(
    private userPlanRepo: UserPlanRepository,
    private newsFetchLogRepo: NewsFetchLogRepository,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const { user } = request;

    if (!user) {
      throw new NotFoundException('User not exists');
    }

    const userPlan = await this.userPlanRepo.findByUserId(user.id);

    if (!userPlan) {
      throw new NotFoundException('User plan not found');
    }

    const dailyFetchLimit = userPlan.plan.daily_fetch_limit;

    // null = unlimited
    if (dailyFetchLimit === null) {
      request.remainingFetchLimit = null;
      return true;
    }

    const sum = await this.newsFetchLogRepo.sumArticleFetchToday(user.id);

    if (sum >= dailyFetchLimit) {
      throw new ForbiddenException(
        'Daily fetch limit reached. Upgrade your plan for more access.',
      );
    }

    request.remainingFetchLimit = dailyFetchLimit - sum;

    return true;
  }
}