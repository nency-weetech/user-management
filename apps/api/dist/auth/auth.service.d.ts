import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login-user.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { MailService } from '../mail/mail.service';
import { VerifyEmailDto } from './dto/email-verify.dto';
import { ForgotPasswordDto } from './dto/forgget-pass.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RateLimitService } from '../rate-limit/rate-limit.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { SignUpCountService } from '../sign-up-count/sign-up-count.service';
import { SoftDeleteService } from '../soft-delete/soft-delete.service';
export declare class AuthService {
    private userService;
    private jwtService;
    private mailService;
    private rateLimitService;
    private activityLogService;
    private signUpCountService;
    private softDeleteService;
    constructor(userService: UsersService, jwtService: JwtService, mailService: MailService, rateLimitService: RateLimitService, activityLogService: ActivityLogService, signUpCountService: SignUpCountService, softDeleteService: SoftDeleteService);
    register(createUserDto: CreateUserDto): Promise<any>;
    verifyEmail(dto: VerifyEmailDto): Promise<{
        message: string;
    }>;
    login(dto: LoginDto): Promise<LoginResponseDto>;
    genrateToken(userId: string, email: string, role: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    updateRefreshTokenHash(userId: string, refreshToken: string): Promise<void>;
    refreshTokens(userId: string, refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string): Promise<void>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    verifyOtp(dto: VerifyEmailDto): Promise<{
        message: string;
        resetSessionToken: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map