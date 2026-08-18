import Redis from 'ioredis';
import { UsersService } from '../users/users.service';
export declare class SoftDeleteService {
    private redis;
    private userService;
    constructor(redis: Redis, userService: UsersService);
    private readonly GRACE_PERIOD_SECOND;
    private key;
    requestDeletion(userId: string): Promise<void>;
    isPendingDeletion(userId: string): Promise<boolean>;
    cancelDeletion(userId: string): Promise<void>;
}
//# sourceMappingURL=soft-delete.service.d.ts.map