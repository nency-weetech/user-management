import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login-user.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService : AuthService){}
    
    @Post('login')
    async login(@Body() loginDto: LoginDto) : Promise<LoginResponseDto>{
        return await this.authService.login(loginDto)
    }
}
