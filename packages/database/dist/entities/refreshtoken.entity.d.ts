import { User } from "./user.entity";
export declare class RefreshToken {
    id: string;
    user_id: string;
    user: User;
    token_hash: string;
    device_info?: string;
    ip_address?: string;
    expires_at: Date;
    created_at: Date;
    revoked_at?: Date;
}
