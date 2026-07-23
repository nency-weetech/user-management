import {
  Body,
  Controller,
  Get,
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

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
};
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}

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

  @Get('refresh')
  @UseGuards(AuthGuard)
  async refreshToken(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
    @currentUser() currentUser: { id: string },
  ) {
    const refreshToken = req.cookies?.['refreshToken'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing from cookies');
    }
    const userId = currentUser.id;

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

  @Get()
  @UseGuards(AuthGuard)
  async getProfile(@currentUser() currentUser: { id: string }) {
    const user = await this.userService.findOne(currentUser.id);
    if (!user) {
      throw new UnauthorizedException('Please Login..');
    }
    return user;
  }
}
