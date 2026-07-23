import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login-user.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import  {type Response }from 'express';
import { currentUser } from 'src/decorators/current-user.decorator';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { UsersService } from 'src/users/users.service';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private userService : UsersService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({passthrough: true} ) res: Response): Promise<LoginResponseDto> {
    const result = await this.authService.login(loginDto);
    res.cookie('accessToken', result.accessToken, {
        httpOnly : true,
        secure : process.env.NODE_ENV === 'production',
        sameSite : 'lax',
        maxAge : 24 * 60 * 60 * 1000
    })
    res.cookie('refreshToken', result.refreshToken, {
        httpOnly : true,
        secure : process.env.NODE_ENV === 'production',
        sameSite : 'lax',
        maxAge : 24 * 60 * 60 * 1000
    })
    return result;
  }

  @Get('logout')
  async logout(@Req() req: any, @Res({passthrough: true}) res: Response) {
    const token = req.cookies?.['accessToken'];
    if(!token){
      throw new UnauthorizedException('User already Logged out');
    }
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/'
    })
    //req.message = 'User Sign out'
    return null;
  }

  @Get()
  @UseGuards(AuthGuard)
  async getProfile(@currentUser() currentUser : {id: string}){
    const user = await this.userService.findOne(currentUser.id)
    if(!user){
      throw new UnauthorizedException('Please Login..')
    }
    return user;
  }

  
}
