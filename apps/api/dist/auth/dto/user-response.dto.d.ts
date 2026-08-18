import { UserRole } from "@myapp/database";
export declare class UserResponseDto {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    lastLoginAt?: Date;
}
//# sourceMappingURL=user-response.dto.d.ts.map