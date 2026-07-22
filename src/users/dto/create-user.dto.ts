import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { UserRole } from "../enums/user-role.enum";

export class CreateUserDto {
    @IsEmail({}, {message: "Please provide a valid email"})
    @IsNotEmpty()
    email!: string;

    @IsString()
    @MinLength(8, {message : 'Password must be at least 8 character long'})
    @IsNotEmpty()
    password!: string;

    @IsString()
    @IsNotEmpty()
    firstName!:string;

    @IsString()
    @IsNotEmpty()
    lastName!: string;

    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole
}
