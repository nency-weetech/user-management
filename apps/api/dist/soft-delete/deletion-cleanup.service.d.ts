import { UsersService } from '../users/users.service';
export declare class DeletionCleanupService {
    private userService;
    constructor(userService: UsersService);
    cleanUpStaleDeletion(): Promise<void>;
}
