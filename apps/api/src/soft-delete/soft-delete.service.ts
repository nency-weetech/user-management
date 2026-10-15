import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { UsersService } from '../users/users.service';

@Injectable()
export class SoftDeleteService {
  constructor(
    @Inject('REDIS_CLIENT') private redis: Redis,
    private userService: UsersService,
  ) {}

  private readonly GRACE_PERIOD_SECOND = 30; //its 30 sec.. --> 30 * 24 * 60 * 60 --> 30 days

  private key(userId: string) {
    return `pending_deletion:${userId}`;
  }

  async requestDeletion(userId: string){
    await this.redis.set(this.key(userId), "1", "EX", this.GRACE_PERIOD_SECOND);
    await this.userService.markPendingDeletion(userId);
  }

  async isPendingDeletion(userId: string): Promise<boolean>{
    const result = await this.redis.get(this.key(userId))
    return result !== null;
  }

  async cancelDeletion(userId: string){
    await this.redis.del(this.key(userId))
    await this.userService.cancelPandingDeletion(userId)
  }
}
