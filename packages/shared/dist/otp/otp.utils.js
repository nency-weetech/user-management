"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTP_TTL_MS = void 0;
exports.generateOtp = generateOtp;
exports.hashOtp = hashOtp;
exports.verifyOtp = verifyOtp;
const crypto_1 = require("crypto");
exports.OTP_TTL_MS = 15 * 60 * 1000;
function secret() {
    const s = process.env.OTP_HMAC_SECRET;
    if (!s)
        throw new Error('OTP_HMAC_SECRET is not set');
    return s;
}
function generateOtp() {
    return String((0, crypto_1.randomInt)(0, 1_000_000)).padStart(6, '0');
}
function hashOtp(otp, email) {
    return (0, crypto_1.createHmac)('sha256', secret())
        .update(`${email.toLowerCase()}:${otp}`)
        .digest('hex');
}
function verifyOtp(otp, email, stored) {
    const a = Buffer.from(hashOtp(otp, email), 'hex');
    const b = Buffer.from(stored, 'hex');
    return a.length === b.length && (0, crypto_1.timingSafeEqual)(a, b);
}
//# sourceMappingURL=otp.utils.js.map