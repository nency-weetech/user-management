// otp.util.ts
import { createHmac, timingSafeEqual } from 'crypto';

const SECRET = process.env.OTP_HMAC_SECRET!;

export function hashOtp(otp: string, email: string): string {
  return createHmac('sha256', SECRET)
    .update(`${email.toLowerCase()}:${otp}`)
    .digest('hex');
}

export function verifyOtp(otp: string, email: string, stored: string): boolean {
  const a = Buffer.from(hashOtp(otp, email), 'hex');
  const b = Buffer.from(stored, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}