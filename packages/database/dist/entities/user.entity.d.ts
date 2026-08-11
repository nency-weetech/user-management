import { UserRole } from '../enums/user-role.enum';
export declare class User {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
    isEmailVerified: boolean;
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
