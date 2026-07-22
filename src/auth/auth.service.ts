import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import { LoginResponseDto } from './dto/login-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResponseDto> {

    if (!dto || !dto.email) {
      throw new UnauthorizedException('Email and password are required');
    }
    const user = await this.userService.findEmailWithPassword(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credantial');
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
    const token = this.jwtService.sign(payload);

    return plainToInstance(
      LoginResponseDto,
      {
        token,
        tokenType: 'Bearer',
        user,
      },
      { excludeExtraneousValues: true },
    );
  }
}
