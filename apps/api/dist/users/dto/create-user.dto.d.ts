import { UserRole } from "@myapp/database";
export declare class CreateUserDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
}
