import { Expose, Type } from 'class-transformer'
import { UserResponseDto } from './user-response.dto';
import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...' })
  @Expose()
  accessToken!: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...' })
  @Expose()
  refreshToken!: string;

  @ApiProperty({example: 'Bearer'})
  @Expose()
  tokenType: string = 'Bearer';

  @ApiProperty()
  @Expose()
  @Type(() => UserResponseDto)
  user!: UserResponseDto;
}