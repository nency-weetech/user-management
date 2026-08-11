import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { UserRole } from 'src/users/enums/user-role.enum';

export class UserResponseDto {
  @ApiProperty({example : ''})
  @Expose()
  id!: string;

  @ApiProperty({example : 'user@example.com'})
  @Expose()
  email!: string;

  @ApiProperty({example : 'John'})
  @Expose()
  firstName!: string;

  @ApiProperty({example : 'Doe'})
  @Expose()
  lastName!: string;

  @ApiProperty({example : 'user'})
  @Expose()
  role!: UserRole;

  @ApiProperty({example : true})
  @Expose()
  isActive!: boolean;

  @Expose()
  createdAt!: Date;

  @Expose()
  lastLoginAt?: Date;
}