export declare const OTP_TTL_MS: number;
export declare function generateOtp(): string;
export declare function hashOtp(otp: string, email: string): string;
export declare function verifyOtp(otp: string, email: string, stored: string): boolean;
//# sourceMappingURL=otp.utils.d.ts.map