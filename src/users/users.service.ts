import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserRole } from './enums/user-role.enum';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User> ) {}

  async create(userData : Partial<User>) : Promise<User>{
    const user = await this.repo.create(userData);
    return this.repo.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.repo.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string) : Promise<User|null>{
    return await this.repo.findOne({where : {email}})
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
    console.log(refreshTokenparams);
    user.refreshToken = refreshTokenparams ?? null;
    await this.repo.save(user);
    console.log(user.refreshToken);
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
}
