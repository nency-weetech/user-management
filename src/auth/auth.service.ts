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
}
