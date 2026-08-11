import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { UserRole } from "@myapp/database";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateUserDto {
    @ApiProperty({ example: 'user@test.com' })
    @IsEmail({}, {message: "Please provide a valid email"})
    @IsNotEmpty()
    email!: string;

    @ApiProperty({ example: 'password@123' })
    @IsString()
    @MinLength(8, {message : 'Password must be at least 8 character long'})
    @IsNotEmpty()
    password!: string;

    @ApiPropertyOptional({ example: 'John' })
    @IsString()
    @IsNotEmpty()
    firstName!:string;

    @ApiPropertyOptional({ example: 'Doe' })
    @IsString()
    @IsNotEmpty()
    lastName!: string;

    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole
}
