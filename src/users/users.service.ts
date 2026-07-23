import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { UserRole } from './enums/user-role.enum';
import crypto from 'crypto';
import { MailService } from 'src/mail/mail.service';
@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>, private mailService: MailService ) {}
  async create(createUserDto: CreateUserDto) : Promise<any>{
    const existEmail = await this.repo.findOne({
      where: { email: createUserDto.email },
    });
    if (existEmail) {
      throw new ConflictException('User with this email already exist');
    }

    const saltRound = 10;
    const password = await bcrypt.hash(createUserDto.password, saltRound);

    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

    const newUser = this.repo.create({
      ...createUserDto,
      password,
      isEmailVerified : false,
      emailVerificationOtp : hashedOtp,
      emailVerificationExpires : otpExpires
    });

    await this.mailService.sendVerificationOtpEmail(newUser.email, otp);
    return {message : 'Register successfull! Verify email to check you email'};
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
