import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login-user.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { type Response } from 'express';
import { currentUser } from 'src/decorators/current-user.decorator';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import { VerifyEmailDto } from './dto/email-verify.dto';
import { ForgotPasswordDto } from './dto/forgget-pass.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Throttle } from '@nestjs/throttler';
import { ActivityLogService } from 'src/activity-log/activity-log.service';
import { SoftDeleteService } from 'src/soft-delete/soft-delete.service';
import { JwtService } from '@nestjs/jwt';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
};
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private userService: UsersService,
    private activityLogservice: ActivityLogService,
    private softDeleteService: SoftDeleteService,
  ) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered, verification OTP sent',
  })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @Post('/signUp')
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.authService.register(createUserDto);
  }

  @ApiOperation({ summary: 'Verify email using OTP' })
  @ApiResponse({ status: 200, description: 'Email Verified successfully' })
  @ApiResponse({ status: 400, description: 'Email is already verified' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Post('verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @ApiOperation({ summary: 'Login with email or password' })
  @ApiResponse({
    status: 201,
    description: 'Login Successfull, token set as a cookie',
  })
  @ApiResponse({ status: 401, description: 'Invalid credantial' })
  @ApiResponse({
    status: 401,
    description: 'Please verify your email address before logging in.',
  })
  @ApiResponse({
    status: 401,
    description: 'Your account has been deactivated/banned. Contact admin.',
  })
  @ApiResponse({ status: 429, description: 'Too many login attempts' })
  @Throttle({ default: { limit: 5, ttl: 300000 } })
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    const result = await this.authService.login(loginDto);
    res.cookie('accessToken', result.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refreshToken', result.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return result;
  }

  @ApiOperation({ summary: 'Refresh access and refresh token using cookie' })
  @ApiCookieAuth('refreshToken')
  @ApiResponse({ status: 200, description: 'Token Refresh successfully' })
  @ApiResponse({ status : 401, description: 'Invalid or missing refresh token'})
  @Get('refresh')
  async refreshToken(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
    @currentUser() currentUser: { id: string },
  ) {
    const refreshToken = req.cookies?.['refreshToken'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing from cookies');
    }

    const decoded = this.jwtService.decode(refreshToken) as {
      id: string;
    } | null;

    if (!decoded?.id) {
      throw new UnauthorizedException('Invalid access token');
    }

    const userId = decoded.id;

    const tokens = await this.authService.refreshTokens(userId, refreshToken);

    res.cookie('accessToken', tokens.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refreshToken', tokens.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { message: 'Tokens refreshed successfully' };
  }

  @ApiOperation({ summary: 'Logged out current user'})
  @ApiCookieAuth('accessToken')
  @ApiResponse({ status : 200, description: 'User logged out successfull'})
  @ApiResponse({ status: 401, description: 'Unathorised'})
  @Get('logout')
  @UseGuards(AuthGuard)
  async logout(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
    @currentUser() currentUser: { id: string },
  ) {
    await this.authService.logout(currentUser.id);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return { message: 'User Logged out' };
  }

  @ApiOperation({ summary: 'Get the current logged in user\'s profile'})
  @ApiCookieAuth('accessToken')
  @ApiResponse({ status: 200, description: 'User fetched Successfully'})
  @ApiResponse({ status: 401, description: 'Unauthorised'})
  @Get()
  @UseGuards(AuthGuard)
  async getProfile(@currentUser() currentUser: { id: string }) {
    const user = await this.userService.findOne(currentUser.id);
    if (!user) {
      throw new UnauthorizedException('Please Login..');
    }
    return user;
  }

  @ApiOperation({summary: 'Request password rest OTP'})
  @ApiResponse({ status: 200, description: 'Generic message return (OTP is sent if account exist'})
  @Post('forgot-password')
  async forgotpass(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @ApiOperation({ summary: 'Verify password rest OTP'})
  @ApiResponse({ status: 200, description: 'OTP verified, reset session token returned'})
  @ApiResponse({ status: 400, description: 'Invalid OTP or Too many failed attempts'})
  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyOtp(dto);
  }

  @ApiOperation({ summary: 'Reset pasword using a valid session token'})
  @ApiResponse({ status: 200, description: 'Password rest successfully'})
  @ApiResponse({ status: 401, description: 'Invalid or expired session token'})
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @ApiOperation({ summary: 'Get recent activity log for user'})
  @ApiParam({name: 'id', description: 'User Id'})
  @ApiResponse({ status: 200, description: 'Activity list returned'})
  @UseGuards(AuthGuard)
  @Get(':id/activity')
  async getActivity(@Param('id') id: string) {
    return this.activityLogservice.getRecentActivity(id);
  }

  @ApiOperation({summary: 'Request account deletion (30-day grace period)'})
  @ApiResponse({ status: 200, description: 'Account schedule for deletion'})
  @ApiCookieAuth('accessToken')
  @Delete('account')
  @UseGuards(AuthGuard)
  async deleteAccount(@currentUser() user: User) {
    await this.softDeleteService.requestDeletion(user.id);
    return {
      message:
        'Your account is scheduled for deletion in 30 days. Log in anytime before then to cancel.',
    };
  }
}
