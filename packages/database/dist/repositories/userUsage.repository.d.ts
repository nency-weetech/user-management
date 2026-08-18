import { BaseAbstractRepostitory } from '../common/base.repository';
import { UserUsage } from '../entities/userUsage.entity';
import { Repository } from 'typeorm';
import { UserUsageInterface } from '../interfaces/userUsage.interface';
export declare class UserUsageRepository extends BaseAbstractRepostitory<UserUsage> implements UserUsageInterface {
    private readonly userUsageRepository;
    constructor(userUsageRepository: Repository<UserUsage>);
    createUsage(userId: string): Promise<UserUsage>;
    findByUserId(userId: string): Promise<UserUsage | null>;
    incrementViewCount(userId: string, by: number): Promise<void>;
    resetDailyCount(userId: string, resetDate: Date): Promise<void>;
}
