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
import { MoreThan, Repository } from 'typeorm';
import { UserRole } from './enums/user-role.enum';
import { UpdateUserStatusDto } from './dto/update-user-state.dto';
import { GetUserQueryDto } from './dto/get-user-query.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { type Cache } from 'cache-manager';
import { ActivityLogService } from 'src/activity-log/activity-log.service';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    private activityLogService : ActivityLogService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  private userCacheKey(id: string) {
    return `user:${id}`;
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = await this.repo.create(userData);
    return this.repo.save(user);
  }

  async findAllPaginated(queryDto: GetUserQueryDto) {
    const { page, limit, search, role, isActive } = queryDto;
    const skip = (page - 1) * limit;

    const query = this.repo.createQueryBuilder('user');

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

    const [items, totalItems] = await query.getManyAndCount();
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
    console.log('its from cached : ', cached);
    if (cached) {
      return cached;
    }

    const user = await this.repo.findOne({ where: { id } });
    console.log('its from database : ', user);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    await this.cacheManager.set(cacheKey, user, 300000);
    await this.activityLogService.logActivity(user.id, 'PROFILE_VIEW')
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.repo.findOne({ where: { email } });
  }

  async findEmailWithPassword(email: string): Promise<User | null> {
    return await this.repo
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password')
      .getOne();
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.repo.update(userId, { lastLoginAt: new Date() });
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUser: User) {
    const user = await this.repo.findOne({ where: { id } });
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

    Object.assign(user, updateUserDto);
    await this.cacheManager.del(this.userCacheKey(id));
    await this.activityLogService.logActivity(user.id, 'UPDATE_PROFILE')
    return await this.repo.save(user);
  }

  async updateRefreshToken(
    userId: string,
    refreshTokenparams: string | null | undefined,
  ): Promise<void> {
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }

    user.refreshToken = refreshTokenparams ?? null;
    await this.repo.save(user);
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async markEmailAsValid(userId: string) {
    await this.repo.update(userId, {
      isEmailVerified: true,
      emailVerificationOtp: null,
      emailVerificationExpires: null,
    });
  }

  async saveOtp(userId: string, otpHash: string, expires: Date): Promise<void> {
    await this.repo.update(userId, {
      passwordResetOtp: otpHash,
      resetOtpExpires: expires,
      otpAttempts: 0,
    });
  }

  async incrementOtpAttemp(userId: string): Promise<void> {
    await this.repo.increment({ id: userId }, 'otpAttempts', 1);
  }

  async clearOtp(userId: string): Promise<void> {
    await this.repo.update(userId, {
      passwordResetOtp: null,
      resetOtpExpires: null,
      otpAttempts: 0,
    });
  }

  async updatePasswordAndRevokeSession(
    userId: string,
    newPass: string,
  ): Promise<void> {
    await this.repo.update(userId, {
      password: newPass,
      passwordResetOtp: null,
      resetOtpExpires: null,
      otpAttempts: 0,
      refreshToken: null,
    });
  }

  async updateUserStatus(userId: string, dto: UpdateUserStatusDto) {
    const user = await this.repo.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isActive = dto.isActive;

    if (!dto.isActive) {
      user.refreshToken = null;
    }

    return this.repo.save(user);
  }

  async countSignupUser(date : Date) : Promise<number> {
    return await this.repo.count({
      where : {createdAt: MoreThan(date)}
    })
  }
}
