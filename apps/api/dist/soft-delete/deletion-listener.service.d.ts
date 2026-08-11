import { OnModuleInit } from '@nestjs/common';
import { UsersService } from '../users/users.service';
export declare class DeletionListenerService implements OnModuleInit {
    private userService;
    private subsriber;
    constructor(userService: UsersService);
    onModuleInit(): void;
}
