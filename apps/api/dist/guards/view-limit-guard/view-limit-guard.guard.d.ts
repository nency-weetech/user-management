import { UserPlanRepository, UserUsageRepository } from '@myapp/database';
import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class ViewLimitGuard implements CanActivate {
    private userPlanRepo;
    private userUsageRepo;
    constructor(userPlanRepo: UserPlanRepository, userUsageRepo: UserUsageRepository);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
//# sourceMappingURL=view-limit-guard.guard.d.ts.map