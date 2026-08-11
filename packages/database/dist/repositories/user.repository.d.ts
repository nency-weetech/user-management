import { BaseAbstractRepostitory } from '../common/base.repository';
import { User } from '../entities/user.entity';
import { UserInterfaceRepository } from '../interfaces/user.interface';
import { Repository } from 'typeorm';
export declare class UserRepository extends BaseAbstractRepostitory<User> implements UserInterfaceRepository {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    findByEmail(email: string): Promise<User | null>;
    findEmailWithPassword(email: string): Promise<User | null>;
    findAllPaginated(page: number, limit: number, search?: string, role?: string, isActive?: boolean): Promise<[User[], number]>;
    updateLastLogin(userId: string): Promise<void>;
    updateName(id: string, firstName?: string, lastName?: string): Promise<User | null>;
    updateRefreshToken(userId: string, refreshToken: string | null): Promise<void>;
    markEmailAsValid(userId: string): Promise<void>;
    saveOtp(userId: string, otpHash: string, expires: Date): Promise<void>;
    incrementOtpAttempt(userId: string): Promise<void>;
    clearOtp(userId: string): Promise<void>;
    updatePasswordAndRevokeSession(userId: string, newPass: string): Promise<void>;
    updateUserStatus(userId: string, isActive: boolean): Promise<User | null>;
    countSignupsSince(date: Date): Promise<number>;
    getSignupUsersSince(date: Date): Promise<Pick<User, 'id' | 'email' | 'createdAt'>[]>;
    markPendingDeletion(userId: string): Promise<void>;
    cancelPendingDeletion(userId: string): Promise<void>;
    findStaleDeletionRequests(cutoffDate: Date): Promise<User[]>;
    updateCreatedAtForTest(userId: string, date: Date): Promise<void>;
}
