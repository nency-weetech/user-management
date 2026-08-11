import { BaseInterfaceRepository } from '../common/base.interface';
import { User } from '../entities/user.entity';

export interface UserInterfaceRepository extends BaseInterfaceRepository<User> {
  findByEmail(email: string): Promise<User | null>;
  findEmailWithPassword(email: string): Promise<User | null>;
  findAllPaginated(
    page: number,
    limit: number,
    search?: string,
    role?: string,
    isActive?: boolean,
  ): Promise<[User[], number]>;

  updateLastLogin(userId: string): Promise<void>;
  updateName(id: string, firstName?: string, lastName?: string): Promise<User | null>;
  updateRefreshToken(userId: string, token: string | null): Promise<void>;
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
