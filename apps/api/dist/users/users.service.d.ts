import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@myapp/database';
import { UpdateUserStatusDto } from './dto/update-user-state.dto';
import { GetUserQueryDto } from './dto/get-user-query.dto';
import { type Cache } from 'cache-manager';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { UserRepository } from '@myapp/database';
export declare class UsersService {
    private repo;
    private activityLogService;
    private cacheManager;
    constructor(repo: UserRepository, activityLogService: ActivityLogService, cacheManager: Cache);
    private userCacheKey;
    create(userData: Partial<User>): Promise<User>;
    findAllPaginated(queryDto: GetUserQueryDto): Promise<{
        data: User[];
        meta: {
            totalItems: number;
            itemsCount: number;
            itemsPerPage: number;
            totalPage: number;
            currentPage: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    }>;
    findOne(id: string): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findEmailWithPassword(email: string): Promise<User | null>;
    updateLastLogin(userId: string): Promise<void>;
    update(id: string, updateUserDto: UpdateUserDto, currentUser: User): Promise<User>;
    updateRefreshToken(userId: string, refreshTokenparams: string | null | undefined): Promise<void>;
    markEmailAsValid(userId: string): Promise<void>;
    saveOtp(userId: string, otpHash: string, expires: Date): Promise<void>;
    incrementOtpAttemp(userId: string): Promise<void>;
    clearOtp(userId: string): Promise<void>;
    updatePasswordAndRevokeSession(userId: string, newPass: string): Promise<void>;
    updateUserStatus(userId: string, dto: UpdateUserStatusDto): Promise<User>;
    countSignupUser(date: Date): Promise<number>;
    getSignupUsersSince(date: Date): Promise<Pick<User, 'id' | 'email' | 'createdAt'>[]>;
    markPendingDeletion(userId: string): Promise<void>;
    cancelPandingDeletion(userId: string): Promise<void>;
    permanentDelete(userId: string): Promise<void>;
    findStaleDeletionRequests(cutoffDate: Date): Promise<User[]>;
    updateCreatedAtForTest(userId: string, date: Date): Promise<void>;
}
