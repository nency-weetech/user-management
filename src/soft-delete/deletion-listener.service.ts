import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class DeletionListenerService implements OnModuleInit{
    private subsriber : Redis;
    constructor(private userService : UsersService){
        this.subsriber = new Redis({host: 'localhost', port: 6379});
    }

    onModuleInit() {
        this.subsriber.subscribe('__keyevent@0__:expired')  ;

        this.subsriber.on('message', async(channel, expiredKey) => {
            if(expiredKey.startsWith('pending_deletion:')){
                const userId = expiredKey.replace('pending_deletion:', '')
                console.log(`Grace period expired for user ${userId} — deleting permanently`);
                await this.userService.permanentDelete(userId)
            }
        })
    }
}
