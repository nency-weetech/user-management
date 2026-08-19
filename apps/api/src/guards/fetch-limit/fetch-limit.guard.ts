import {
  NewsFetchLogRepository,
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
export class FetchLimitGuard implements CanActivate {
  constructor(
    private userPlanRepo: UserPlanRepository,
    private newsFetchLogRepo: NewsFetchLogRepository,
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
      request.remainingFetchLimit = null;
      return true;
    }

    const DAILY_FETCH_LIMIT = userPlan.plan === UserPlanEnum.PRO ? 60 : 30;
    const sum = await this.newsFetchLogRepo.sumArticleFetchToday(user.id);

    if (sum >= DAILY_FETCH_LIMIT) {
      throw new ForbiddenException(
        'Daily View limit Reached, Upgrad plan for unlimited access.',
      );
    }
    request.remainingFetchLimit = DAILY_FETCH_LIMIT - sum;
    return true;
  }
}
