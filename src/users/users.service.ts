import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { LessThan, MoreThan, Repository } from 'typeorm';
import { UserRole } from './enums/user-role.enum';
import { UpdateUserStatusDto } from './dto/update-user-state.dto';
import { GetUserQueryDto } from './dto/get-user-query.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { type Cache } from 'cache-manager';
import { ActivityLogService } from 'src/activity-log/activity-log.service';
import { UserRepository } from './user.repository';
@Injectable()
export class UsersService {
  constructor(
    private repo: UserRepository,
    private activityLogService: ActivityLogService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  private userCacheKey(id: string) {
    return `user:${id}`;
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.repo.create(userData);
    return this.repo.save(user);
  }

  async findAllPaginated(queryDto: GetUserQueryDto) {
    const { page, limit, search, role, isActive } = queryDto;
    const [items, totalItems] = await this.repo.findAllPaginated(
      page,
      limit,
      search,
      role,
      isActive,
    );

    const totalPage = Math.ceil(totalItems / limit);
    return {
      data: items,
      meta: {
        totalItems,
        itemsCount: items.length,
        itemsPerPage: limit,
        totalPage,
        currentPage: page,
        hasNextPage: page < totalPage,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<User> {
    const cacheKey = await this.userCacheKey(id);

    const cached = await this.cacheManager.get<User>(cacheKey);
    if (cached) {
      return cached;
    }
    const user = await this.repo.findOneById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    await this.cacheManager.set(cacheKey, user, 300000);
    return user;
  }

  async findByKeycloakId(keycloakId: string) {
    const user = await this.repo.findOne({where : {keycloakId}})
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.repo.findByEmail(email);
  }

  async findEmailWithPassword(email: string): Promise<User | null> {
    return this.repo.findEmailWithPassword(email);
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.repo.updateLastLogin(userId);
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUser: User) {
    const user = await this.repo.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isAdmin = currentUser.role === UserRole.ADMIN;
    const isSelf = currentUser.id === id;

    if (!isAdmin && !isSelf) {
      throw new ForbiddenException('You can update only your own profile');
    }

    if (updateUserDto.role && !isAdmin) {
      throw new ForbiddenException('Only admins can change user roles');
    }

    const updatedUser = await this.repo.updateName(id, updateUserDto.firstName, updateUserDto.lastName);
    
    await this.cacheManager.del(this.userCacheKey(id));
    await this.activityLogService.logActivity(user.id, 'UPDATE_PROFILE');
    return updatedUser;
  }

  async updateRefreshToken(
    userId: string,
    refreshTokenparams: string | null | undefined,
  ): Promise<void> {
    const user = await this.repo.findOneById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }
    return this.repo.updateRefreshToken(userId, refreshTokenparams ?? null);
  }

  async markEmailAsValid(userId: string) {
    await this.repo.markEmailAsValid(userId);
  }

  async saveOtp(userId: string, otpHash: string, expires: Date): Promise<void> {
    await this.repo.saveOtp(userId, otpHash, expires);
  }

  async incrementOtpAttemp(userId: string): Promise<void> {
    await this.repo.incrementOtpAttempt(userId);
  }

  async clearOtp(userId: string): Promise<void> {
    await this.repo.clearOtp(userId);
  }

  async updatePasswordAndRevokeSession(
    userId: string,
    newPass: string,
  ): Promise<void> {
    await this.repo.updatePasswordAndRevokeSession(userId, newPass);
  }

  async updateUserStatus(userId: string, dto: UpdateUserStatusDto) {
    const user = await this.repo.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async countSignupUser(date: Date): Promise<number> {
    return await this.repo.countSignupsSince(date);
  }

  async getSignupUsersSince(
    date: Date,
  ): Promise<Pick<User, 'id' | 'email' | 'createdAt'>[]> {
    return await this.repo.getSignupUsersSince(date);
  }

  async markPendingDeletion(userId: string) {
    await this.repo.markPendingDeletion(userId);
    await this.cacheManager.del(this.userCacheKey(userId));
    await this.activityLogService.logActivity(userId, 'DELETE_REQUEST')
  }

  async cancelPandingDeletion(userId: string) {
    (await this.repo.cancelPendingDeletion(userId),
      await this.cacheManager.del(this.userCacheKey(userId)));
  }

  async permanentDelete(userId: string): Promise<void> {
    const user = await this.repo.findOneById(userId);
    if (user) {
      await this.repo.remove(user);
    }
    await this.cacheManager.del(this.userCacheKey(userId));
  }

  async findStaleDeletionRequests(cutoffDate: Date) {
    return this.repo.findStaleDeletionRequests(cutoffDate);
  }

  async updateCreatedAtForTest(userId: string, date: Date) {
    await this.repo.updateCreatedAtForTest(userId, date);
  }
}
