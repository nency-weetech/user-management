import Redis from 'ioredis';
export declare class ActivityLogService {
    private redis;
    constructor(redis: Redis);
    logActivity(userId: string, action: string): Promise<void>;
    getRecentActivity(userId: string): Promise<any[]>;
}
