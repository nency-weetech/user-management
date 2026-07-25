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
import { ForgotPasswordDto } from './dto/forgget-pass.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RateLimitService } from 'src/rate-limit/rate-limit.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
    private rateLimitService : RateLimitService
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

    if (!user) throw new NotFoundException('User Not found');
    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    if (!user.emailVerificationOtp || !user.emailVerificationExpires) {
      throw new BadRequestException('No OTP found');
    }

    if (user.emailVerificationExpires < new Date()) {
      throw new BadRequestException('OTP expired');
    }

    const isValidOtp = await bcrypt.compare(dto.otp, user.emailVerificationOtp);

    if (!isValidOtp) {
      throw new BadRequestException('Invalid OTP');
    }

    await this.userService.markEmailAsValid(user.id);

    return { message: 'Email verify successfully! now you can login' };
  }

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    if (!dto || !dto.email) {
      throw new UnauthorizedException('Email and password are required');
    }

    await this.rateLimitService.checkLoginAttempt(dto.email);
    const user = await this.userService.findEmailWithPassword(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credantial');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Please verify your email address before logging in.',
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Your account has been deactivated/banned. Contact admin.',
      );
    }

    const isPassworValid = await bcrypt.compare(dto.password, user.password);
    if (!isPassworValid) {
      throw new UnauthorizedException('Invalid credantial');
    }

    await this.userService.updateLastLogin(user.id);
    await this.rateLimitService.resetAttempts(dto.email);

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

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      return {
        message: 'If an account exists with that email, an OTP has been sent.',
      };
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

    await this.userService.saveOtp(user.id, hashedOtp, otpExpires);
    await this.mailService.sendResetPassOtpEmail(user.email, otp);

    return {
      message: 'If an account exists with that email, an OTP has been sent.',
    };
  }

  async verifyOtp(dto: VerifyEmailDto) {
    const user = await this.userService.findByEmail(dto.email);

    if (!user || !user.passwordResetOtp || !user.resetOtpExpires) {
      throw new BadRequestException('Invalid or expires OTP');
    }

    if (user.resetOtpExpires < new Date()) {
      throw new BadRequestException('OTP expired');
    }

    if (user.otpAttempts >= 3) {
      await this.userService.clearOtp(user.id);
      throw new BadRequestException(
        'Too many failed attempts. OTP invalidated.',
      );
    }

    const isValidOtp = await bcrypt.compare(dto.otp, user.passwordResetOtp);

    if (!isValidOtp) {
      await this.userService.incrementOtpAttemp(user.id);
      const updatedAttempts = user.otpAttempts + 1;
      const remainingAttempts = 3 - updatedAttempts;
      throw new BadRequestException(
        `Invalid OTP. ${remainingAttempts > 0 ? remainingAttempts + ' attempts remaining.' : 'OTP invalidated.'}`,
      );
    }

    await this.userService.clearOtp(user.id);

    const resetSessionToken = await this.jwtService.signAsync(
      { sub: user.id, purpose: 'password_reset' },
      {
        secret: process.env.JWT_RESET_SECRET || 'reset-secret',
        expiresIn: '10m',
      },
    );
    return {
      message: 'OTP verified successfully.',
      resetSessionToken,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(dto.resetSessionToken, {
        secret: process.env.JWT_RESET_SECRET || 'reset-secret',
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired reset session token');
    }

    if (payload.purpose !== 'password_reset') {
      throw new UnauthorizedException('Invalid token purpose');
    }

    const user = await this.userService.findOne(payload.sub);
    if (!user) {
      throw new BadRequestException('User no longer exists');
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.userService.updatePasswordAndRevokeSession(
      user.id,
      newPasswordHash,
    );

    return {
      message:
        'Password has been reset successfully. Please log in with your new password.',
    };
  }
}
