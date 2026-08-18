import { NewsFetchLogRepository, UserPlanRepository } from '@myapp/database';
import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class FetchLimitGuard implements CanActivate {
    private userPlanRepo;
    private newsFetchLogRepo;
    constructor(userPlanRepo: UserPlanRepository, newsFetchLogRepo: NewsFetchLogRepository);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
//# sourceMappingURL=fetch-limit.guard.d.ts.map