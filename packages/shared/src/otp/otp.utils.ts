import { createHmac, randomInt, timingSafeEqual } from 'crypto';

export const OTP_TTL_MS = 15 * 60 * 1000; 

function secret(): string {
  const s = process.env.OTP_HMAC_SECRET;
  if (!s) throw new Error('OTP_HMAC_SECRET is not set');
  return s;
}

export function generateOtp(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

export function hashOtp(otp: string, email: string): string {
  return createHmac('sha256', secret())
    .update(`${email.toLowerCase()}:${otp}`)
    .digest('hex');
}

export function verifyOtp(otp: string, email: string, stored: string): boolean {
  const a = Buffer.from(hashOtp(otp, email), 'hex');
  const b = Buffer.from(stored, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}