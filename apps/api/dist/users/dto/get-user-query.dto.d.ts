import { UserRole } from "@myapp/database";
export declare class GetUserQueryDto {
    page: number;
    limit: number;
    search?: string;
    role?: UserRole;
    isActive?: boolean;
}
