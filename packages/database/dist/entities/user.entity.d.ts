import { UserRole } from '../enums/user-role.enum';
import { RoomMember } from './roomMember.entity';
import { Message } from './message.entity';
import { Room } from './room.entity';
export declare class User {
    id: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    is_active: boolean;
    is_email_verified: boolean;
    room_memberships: RoomMember[];
    messages: Message[];
    owned_rooms: Room[];
    email_verification_otp?: string | null;
    email_verification_expires?: Date | null;
    password_reset_otp?: string | null;
    reset_otp_expires?: Date | null;
    otp_attempts: number;
    refreshToken?: string | null;
    lastLoginAt: Date | null;
    created_at: Date;
    updated_at: Date;
    is_pending_deletion: boolean;
    deletion_requested_at: Date | null;
    deleted_at: Date | null;
}
