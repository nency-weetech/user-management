import { AuthService } from './auth.service';
import { LoginDto } from './dto/login-user.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { type Response } from 'express';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '@myapp/database';
import { VerifyEmailDto } from './dto/email-verify.dto';
import { ForgotPasswordDto } from './dto/forgget-pass.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { SoftDeleteService } from '../soft-delete/soft-delete.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthController {
    private authService;
    private jwtService;
    private userService;
    private activityLogservice;
    private softDeleteService;
    constructor(authService: AuthService, jwtService: JwtService, userService: UsersService, activityLogservice: ActivityLogService, softDeleteService: SoftDeleteService);
    create(createUserDto: CreateUserDto): Promise<User>;
    verifyEmail(dto: VerifyEmailDto): Promise<{
        message: string;
    }>;
    login(loginDto: LoginDto, res: Response): Promise<LoginResponseDto>;
    refreshToken(req: any, res: Response, currentUser: {
        id: string;
    }): Promise<{
        message: string;
    }>;
    logout(req: any, res: Response, currentUser: {
        id: string;
    }): Promise<{
        message: string;
    }>;
    getProfile(currentUser: {
        id: string;
    }): Promise<User>;
    forgotpass(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    verifyOtp(dto: VerifyEmailDto): Promise<{
        message: string;
        resetSessionToken: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    getActivity(id: string): Promise<any[]>;
    deleteAccount(user: User): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=auth.controller.d.ts.map