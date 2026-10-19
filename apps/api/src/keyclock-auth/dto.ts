import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class KcLoginDto {
  @IsEmail() email: string;
  @IsString() @IsNotEmpty() password: string;
}

export class KcRegisterDto {
  @IsEmail() email: string;
  @IsString() @MinLength(8) password: string;
  @IsString() @IsNotEmpty() first_name: string;
  @IsString() @IsNotEmpty() last_name: string;
}