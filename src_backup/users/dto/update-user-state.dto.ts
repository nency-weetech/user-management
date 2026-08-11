// src/users/dto/update-user-status.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateUserStatusDto {
  @ApiProperty({ example: true, description: 'true = activate, false = deactivate' })
  @IsBoolean()
  @IsNotEmpty()
  isActive!: boolean;
}