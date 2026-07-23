import { Expose, Type } from 'class-transformer'
import { UserResponseDto } from './user-response.dto';

export class LoginResponseDto {
  @Expose()
  accessToken!: string;

  @Expose()
  refreshToken!: string;

  @Expose()
  tokenType: string = 'Bearer';

  @Expose()
  @Type(() => UserResponseDto)
  user!: UserResponseDto;
}