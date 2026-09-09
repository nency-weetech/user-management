import { UserRole } from '../enums/user-role.enum';
import { RoomMember } from './roomMember.entity';
import { Message } from './message.entity';
import { Room } from './room.entity';
export declare class User {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
    isEmailVerified: boolean;
    room_memberships: RoomMember[];
    messages: Message[];
    owned_rooms: Room[];
    emailVerificationOtp?: string | null;
    emailVerificationExpires?: Date | null;
    passwordResetOtp?: string | null;
    resetOtpExpires?: Date | null;
    otpAttempts: number;
    refreshToken?: string | null;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    isPendingDeletion: boolean;
    deletionRequestedAt: Date | null;
    deletedAt: Date | null;
}
