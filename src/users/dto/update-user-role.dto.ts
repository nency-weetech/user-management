import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { UserRole } from "../enums/user-role.enum";

export class UpdateUserRole {
    @IsEnum(UserRole)
    @IsNotEmpty()
    role ?: UserRole
}