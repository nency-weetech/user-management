import { Expose } from 'class-transformer';
import { UserRole } from 'src/users/enums/user-role.enum';

export class UserResponseDto {
  @Expose()
  id!: string;

  @Expose()
  email!: string;

  @Expose()
  firstName!: string;

  @Expose()
  lastName!: string;

  @Expose()
  role!: UserRole;

  @Expose()
  isActive!: boolean;

  @Expose()
  createdAt!: Date;

  @Expose()
  lastLoginAt?: Date;
}