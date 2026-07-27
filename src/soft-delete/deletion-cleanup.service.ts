import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class DeletionCleanupService {
    constructor(private userService: UsersService){}

    @Cron('0 0 * * *')
    async cleanUpStaleDetetion() {
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - 30);

        const stalUser = await this.userService.findStaleDeletionRequests(cutoff);

        for (const user of stalUser){
            console.log(`cleanup corn : deleting stale user ${user.id}`)
            await this.userService.permanentDelete(user.id)
        }
    }
}
