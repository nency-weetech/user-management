import { BaseAbstractRepostitory } from '../common/base.repository';
import { User } from '../entities/user.entity';
import { UserInterfaceRepository } from '../interfaces/user.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

export class UserRepository
  extends BaseAbstractRepostitory<User>
  implements UserInterfaceRepository
{
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {
    super(userRepository);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password')
      .getOne();
  }

  async findAllPaginated(
    page: number,
    limit: number,
    search?: string,
    role?: string,
    isActive?: boolean,
  ): Promise<[User[], number]> {
    const skip = (page - 1) * limit;

    const query = this.userRepository.createQueryBuilder('user');

    if (search) {
      query.andWhere('LOWER(user.email) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }

    if (role) {
      query.andWhere('user.role = :role', { role });
    }

    if (isActive !== undefined) {
      query.andWhere('user.isActive = :isActive', { isActive });
    }

    query
      .select([
        'user.id',
        'user.email',
        'user.role',
        'user.isActive',
        'user.isEmailVerified',
        'user.createdAt',
      ])
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    return query.getManyAndCount();
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.update(userId, { lastLoginAt: new Date() });
  }

  async updateName(id: string, firstName?: string, lastName?: string): Promise<User | null> {
    await this.userRepository.update(id, {
      ...(firstName && { first_name : firstName}),
      ...(lastName && { last_name: lastName }),
    });
    return this.userRepository.findOneBy({ id });
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<void> {
    await this.userRepository.update(userId, { refreshToken });
  }

  async markEmailAsValid(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      is_email_verified: true,
      email_verification_otp: null,
      email_verification_expires: null,
    });
  }

  async saveOtp(userId: string, otpHash: string, expires: Date): Promise<void> {
    await this.userRepository.update(userId, {
      password_reset_otp: otpHash,
      reset_otp_expires: expires,
      otp_attempts: 0,
    });
  }

  async incrementOtpAttempt(userId: string): Promise<void> {
    await this.userRepository.increment({ id: userId }, 'otpAttempts', 1);
  }

  async clearOtp(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      password_reset_otp: null,
      reset_otp_expires: null,
      otp_attempts: 0,
    });
  }

  async updatePasswordAndRevokeSession(
    userId: string,
    newPass: string,
  ): Promise<void> {
    await this.userRepository.update(userId, {
      password: newPass,
      password_reset_otp: null,
      reset_otp_expires: null,
      otp_attempts: 0,
      refreshToken: null,
    });
  }

  async updateUserStatus(
    userId: string,
    isActive: boolean,
  ): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.is_active = isActive;

    if (!isActive) {
      user.refreshToken = null;
    }

    return this.userRepository.save(user);
  }

  async countSignupsSince(date: Date): Promise<number> {
    return await this.userRepository.count({
      where: { created_at: MoreThan(date) },
    });
  }
  
  async getSignupUsersSince(
    date: Date,
  ): Promise<Pick<User, 'id' | 'email' | 'created_at'>[]> {
    return await this.userRepository.find({
      where: { created_at: MoreThan(date) },
      select: { email: true, created_at: true },
    });
  }

  async markPendingDeletion(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      is_pending_deletion: true,
      is_active: false,
      deletion_requested_at: new Date(),
    });
  }

  async cancelPendingDeletion(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      is_pending_deletion: false,
      is_active: true,
      deletion_requested_at: null,
    });
  }

  async findStaleDeletionRequests(cutoffDate: Date): Promise<User[]> {
    return this.userRepository.find({
      where: {
        is_pending_deletion: true,
        deletion_requested_at: LessThan(cutoffDate),
      },
    });
  }

  async updateCreatedAtForTest(userId: string, date: Date): Promise<void> {
    await this.userRepository.update(userId, {created_at: date})
  }
}
