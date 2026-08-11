import { type Cache } from 'cache-manager';
export declare class RateLimitService {
    private cacheManager;
    constructor(cacheManager: Cache);
    checkLoginAttempt(email: string): Promise<void>;
    resetAttempts(email: string): Promise<void>;
    checkForgotPasswordAttempt(email: string): Promise<void>;
}
