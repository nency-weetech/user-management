import { BaseInterfaceRepository } from "../common/base.interface";
import { UserUsage } from "../entities/userUsage.entity";
export interface UserUsageInterface extends BaseInterfaceRepository<UserUsage> {
    createUsage(userId: string): Promise<UserUsage>;
    findByUserId(userId: string): Promise<UserUsage | null>;
    incrementViewCount(userId: string, by: number): Promise<void>;
    resetDailyCount(userId: string, resetDate: Date): Promise<void>;
}
