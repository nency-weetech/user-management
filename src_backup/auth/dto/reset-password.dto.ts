// src/auth/dto/reset-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIs...',
    description: 'Reset session token from verify-otp',
  })
  @IsString()
  @IsNotEmpty()
  resetSessionToken!: string;

  @ApiProperty({ example: 'newSecurePass123' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  newPassword!: string;
}
