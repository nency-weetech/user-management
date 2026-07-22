import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login-user.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import  {type Response }from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({passthrough: true} ) res: Response): Promise<LoginResponseDto> {
    const result = await this.authService.login(loginDto);
    res.cookie('accessToken', result.accessToken, {
        httpOnly : true,
        secure : process.env.NODE_ENV === 'production',
        sameSite : 'lax',
        maxAge : 24 * 60 * 60 * 1000
    })
    return result;
  }
}
