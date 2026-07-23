import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import { LoginResponseDto } from './dto/login-response.dto';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import crypto from 'crypto';
import { MailService } from 'src/mail/mail.service';
import { VerifyEmailDto } from './dto/email-verify.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<any> {
    const existEmail = await this.userService.findEmailWithPassword(
      createUserDto.email,
    );
    if (existEmail) {
      throw new ConflictException('User with this email already exist');
    }

    const saltRound = 10;
    const password = await bcrypt.hash(createUserDto.password, saltRound);

    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

    const newUser = await this.userService.create({
      ...createUserDto,
      password,
      isEmailVerified: false,
      emailVerificationOtp: hashedOtp,
      emailVerificationExpires: otpExpires,
    });

    await this.mailService.sendVerificationOtpEmail(newUser.email, otp);
    return { message: 'Register successfull! Verify email to check you email' };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const user = await this.userService.findByEmail(dto.email);

    if(!user) throw new NotFoundException('User Not found');
    if(user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    if(!user.emailVerificationOtp || !user.emailVerificationExpires) {
      throw new BadRequestException('No OTP found');
    }

    if(user.emailVerificationExpires < new Date()){
      throw new BadRequestException('OTP expired');
    }

    const isValidOtp = await bcrypt.compare(dto.otp, user.emailVerificationOtp);

    if(!isValidOtp) {
      throw new BadRequestException('Invalid OTP');
    }

    await this.userService.markEmailAsValid(user.id);

    return {message : 'Email verify successfully! now you can login'}
  }

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    if (!dto || !dto.email) {
      throw new UnauthorizedException('Email and password are required');
    }
    const user = await this.userService.findEmailWithPassword(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credantial');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email address before logging in.');
    }

    const isPassworValid = await bcrypt.compare(dto.password, user.password);
    if (!isPassworValid) {
      throw new UnauthorizedException('Invalid credantial');
    }

    await this.userService.updateLastLogin(user.id);

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    const tokens = await this.genrateToken(
      payload.id,
      payload.email,
      payload.role,
    );
    await this.updateRefreshTokenHash(payload.id, tokens.refreshToken);

    return plainToInstance(
      LoginResponseDto,
      {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenType: 'Bearer',
        user,
      },
      { excludeExtraneousValues: true },
    );
  }

  async genrateToken(userId: string, email: string, role: string) {
    const payload = { id: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.ACCESS_JWT_SECRET,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.REFRESH_JWT_SECRET,
        expiresIn: '7d',
      }),
    ]);
    return { accessToken, refreshToken };
  }

  async updateRefreshTokenHash(userId: string, refreshToken: string) {
    const hashRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userService.updateRefreshToken(userId, hashRefreshToken);
  }
  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userService.findOne(userId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access Denied - Token Reuse Detected');
    }

    const tokens = await this.genrateToken(user.id, user.email, user.role);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string) {
    await this.userService.updateRefreshToken(userId, null);
  }
}
