import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginResponseDto } from './dto/login-response.dto';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from '../users/dto/create-user.dto';
import crypto from 'crypto';
import { MailService } from '../mail/mail.service';
import { VerifyEmailDto } from './dto/email-verify.dto';
import { ForgotPasswordDto } from './dto/forgget-pass.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RateLimitService } from '../rate-limit/rate-limit.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { SignUpCountService } from '../sign-up-count/sign-up-count.service';
import { SoftDeleteService } from '../soft-delete/soft-delete.service';
import { DataSource } from 'typeorm';
import {
  MemberRoles,
  OrganizationMembers,
  OrganizationPlan,
  OrganizationPlanEnum,
  Organizations,
  OrganizationUsage,
  Permissions,
  Profile,
  RefreshTokenRepository,
  RolePermissions,
  Roles,
  User,
} from '@myapp/database';
import { ProfileService } from '../profile/profile.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
    private rateLimitService: RateLimitService,
    private activityLogService: ActivityLogService,
    private signUpCountService: SignUpCountService,
    private softDeleteService: SoftDeleteService,
    private datasource: DataSource,
    private profileService: ProfileService,
    private refreshTokenRepo: RefreshTokenRepository,
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

    const newUser = await this.datasource.transaction(async (manager) => {
      const user = manager.create(User, {
        ...createUserDto,
        password,
        is_email_verified: false,
        email_verification_otp: hashedOtp,
        email_verification_expires: otpExpires,
      });
      await manager.save(user);
      const newProfile = manager.create(Profile, {
        user_id: user.id,
        name: 'Default',
        is_default: true,
      });
      await manager.save(newProfile);

      const org = manager.create(Organizations, {
        owner: { id: user.id } as User,
        name: `${user.first_name}'s Organization`,
        is_default: true,
      });
      await manager.save(org);

      const orgPlan = manager.create(OrganizationPlan, {
        organization: {id: org.id} as Organizations,
        plan: OrganizationPlanEnum.FREE
      });
      await manager.save(orgPlan);

      const orgUsage = manager.create(OrganizationUsage, {
        organization: {id: org.id} as Organizations,
        daily_bookmark_count: 0,
        daily_bookmark_reset_at: null
      })
      await manager.save(orgUsage);

      const orgMember = manager.create(OrganizationMembers, {
        organization: { id: org.id } as Organizations,
        user: { id: user.id } as User,
        joined_at: new Date(),
      });
      await manager.save(orgMember);

      const readPermission = await manager.findOne(Permissions, {
        where: { name: 'Bookmark.Read' },
      });
      const writePermission = await manager.findOne(Permissions, {
        where: { name: 'Bookmark.Write' },
      });
      const deletePermission = await manager.findOne(Permissions, {
        where: { name: 'Bookmark.Delete' },
      });

      if (!readPermission || !writePermission || !deletePermission) {
        throw new Error('Required permissions not seeded');
      }

      const bookmarkViewer = manager.create(Roles, {
        organization_id: org.id,
        name: 'Bookmark_Viewer',
        is_default: true,
      });
      await manager.save(bookmarkViewer);
      const viewerPermission = manager.create(RolePermissions, {
        role_id: bookmarkViewer.id,
        permission_id: readPermission.id,
      });
      await manager.save(viewerPermission);

      const bookmarkAdmin = manager.create(Roles, {
        organization_id: org.id,
        name: 'Bookmark_Admin',
        is_default: true,
      });
      await manager.save(bookmarkAdmin);
      const adminPermission = [
        readPermission,
        writePermission,
        deletePermission,
      ].map((val) =>
        manager.create(RolePermissions, {
          role_id: bookmarkAdmin.id,
          permission_id: val.id,
        }),
      );
      await manager.save(adminPermission);

      const memberRole = manager.create(MemberRoles, {organization_member_id: orgMember.id, role_id: bookmarkAdmin.id})
      await manager.save(memberRole);

      return user;
    });
    

    // const newUser = await this.userService.create({
    //   ...createUserDto,
    //   password,
    //   is_email_verified: false,
    //   email_verification_otp: hashedOtp,
    //   email_verification_expires: otpExpires,
    // });

    await this.mailService.sendVerificationOtpEmail(newUser.email, otp);
    await this.signUpCountService.incrSignUpCount();
    return { message: 'Register successfull! Verify email to check you email' };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const user = await this.userService.findByEmail(dto.email);

    if (!user) throw new NotFoundException('User Not found');
    if (user.is_email_verified) {
      throw new BadRequestException('Email is already verified');
    }

    if (!user.email_verification_otp || !user.email_verification_expires) {
      throw new BadRequestException('No OTP found');
    }

    if (user.email_verification_expires < new Date()) {
      throw new BadRequestException('OTP expired');
    }

    const isValidOtp = await bcrypt.compare(
      dto.otp,
      user.email_verification_otp,
    );

    if (!isValidOtp) {
      throw new BadRequestException('Invalid OTP');
    }

    await this.userService.markEmailAsValid(user.id);
    await this.mailService.welcomeMail(user.email);

    return { message: 'Email verify successfully! now you can login' };
  }

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    if (!dto || !dto.email) {
      throw new UnauthorizedException('Email and password are required');
    }

    //await this.rateLimitService.checkLoginAttempt(dto.email);
    const user = await this.userService.findEmailWithPassword(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credantial');
    }

    if (!user.is_email_verified) {
      throw new UnauthorizedException(
        'Please verify your email address before logging in.',
      );
    }
    const isPendingDeletion = await this.softDeleteService.isPendingDeletion(
      user.id,
    );

    if (!user.is_active && !isPendingDeletion) {
      throw new UnauthorizedException(
        'Your account has been deactivated/banned. Contact admin.',
      );
    }

    const isPassworValid = await bcrypt.compare(dto.password, user.password);
    if (!isPassworValid) {
      throw new UnauthorizedException('Invalid credantial');
    }

    if (isPendingDeletion) {
      await this.softDeleteService.cancelDeletion(user.id);
      await this.activityLogService.logActivity(
        user.id,
        'ACCOUNT_DELETE_REQUEST_CANCEL',
      );
    }

    // await this.userService.updateLastLogin(user.id);
    //await this.rateLimitService.resetAttempts(dto.email);

    const profile = await this.profileService.findDefaultProfile(user.id);

    await this.activityLogService.logActivity(user.id, 'LOGIN');
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      profileId: profile.id,
    };
    const tokens = await this.genrateToken(
      payload.id,
      payload.email,
      payload.role,
      payload.profileId,
    );

    await this.saveRefreshToken(payload.id, tokens.refreshToken);

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

  async genrateToken(
    userId: string,
    email: string,
    role: string,
    profileId?: string,
  ) {
    const payload = { id: userId, email, role, profileId };

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

  // async updateRefreshTokenHash(userId: string, refreshToken: string) {
  //   const hashRefreshToken = await bcrypt.hash(refreshToken, 10);
  //   await this.userService.updateRefreshToken(userId, hashRefreshToken);
  // }

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async saveRefreshToken(
    userId: string,
    refreshToken: string,
    deviceInfo?: string,
    ipAddress?: string,
  ) {
    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.refreshTokenRepo.createAndSaveToken(
      userId,
      tokenHash,
      expiresAt,
      deviceInfo,
      ipAddress,
    );
  }
  async refreshTokens(refreshToken: string, profileId: string) {
    // const user = await this.userService.findOne(userId);
    // if (!user || !user.refreshToken) {
    //   throw new UnauthorizedException('Access Denied');
    // }

    // const refreshTokenMatches = await bcrypt.compare(
    //   refreshToken,
    //   user.refreshToken,
    // );
    // if (!refreshTokenMatches) {
    //   throw new UnauthorizedException('Access Denied - Token Reuse Detected');
    // }

    // const tokens = await this.genrateToken(user.id, user.email, user.role, profileId);
    // await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    // return tokens;

    const tokenHash = this.hashToken(refreshToken);
    const storedToken = await this.refreshTokenRepo.findByTokenHash(tokenHash);

    if (
      !storedToken ||
      storedToken.revoked_at ||
      storedToken.expires_at < new Date()
    ) {
      throw new UnauthorizedException('Access denied');
    }

    const user = await this.userService.findOne(storedToken.user_id);
    if (!user) {
      throw new UnauthorizedException('Access denied');
    }

    const tokens = await this.genrateToken(
      user.id,
      user.email,
      user.role,
      profileId,
    );
    await this.refreshTokenRepo.revoke(storedToken.id);
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string, refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    const storedToken = await this.refreshTokenRepo.findByTokenHash(tokenHash);

    if (storedToken) {
      await this.refreshTokenRepo.revoke(storedToken.id);
    }

    await this.activityLogService.logActivity(userId, 'LOGOUT');
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userService.findByEmail(dto.email);
    await this.rateLimitService.checkForgotPasswordAttempt(dto.email);
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

    await this.rateLimitService.resetAttempts(dto.email);
    return {
      message: 'If an account exists with that email, an OTP has been sent.',
    };
  }

  async verifyOtp(dto: VerifyEmailDto) {
    const user = await this.userService.findByEmail(dto.email);

    if (!user || !user.password_reset_otp || !user.reset_otp_expires) {
      throw new BadRequestException('Invalid or expires OTP');
    }

    if (user.reset_otp_expires < new Date()) {
      throw new BadRequestException('OTP expired');
    }

    if (user.otp_attempts >= 3) {
      await this.userService.clearOtp(user.id);
      throw new BadRequestException(
        'Too many failed attempts. OTP invalidated.',
      );
    }

    const isValidOtp = await bcrypt.compare(dto.otp, user.password_reset_otp);

    if (!isValidOtp) {
      await this.userService.incrementOtpAttemp(user.id);
      const updatedAttempts = user.otp_attempts + 1;
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
    await this.refreshTokenRepo.revokeAllForUser(user.id);
    await this.activityLogService.logActivity(user.id, 'RESET_PASSWORD');

    return {
      message:
        'Password has been reset successfully. Please log in with your new password.',
    };
  }

  // signToken(payload: {userId: string, profileId: string}): string{
  //   return this.jwtService.sign(payload);
  // }
}
