import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { UserRole } from "../enums/user-role.enum";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateUserRole {
    @ApiProperty({ example: 'user' })
    @IsEnum(UserRole)
    @IsNotEmpty()
    role ?: UserRole
}