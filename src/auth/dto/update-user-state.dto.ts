// src/users/dto/update-user-status.dto.ts
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateUserStatusDto {
  @IsBoolean()
  @IsNotEmpty()
  isActive!: boolean;
}