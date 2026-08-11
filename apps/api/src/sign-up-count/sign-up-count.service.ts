import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class SignUpCountService {
    constructor(@Inject('REDIS_CLIENT') private redis: Redis){}

    private readonly counterKey = 'weekly_signup_count';

    async incrSignUpCount(){
        await this.redis.incr(this.counterKey);
    }

    async getSignUpCount(): Promise<number>{
        const count = await this.redis.get(this.counterKey)
        return count ? parseInt(count, 10) : 0;
    }

    async resetSignUpCount() {
        await this.redis.set(this.counterKey, 0);
    }
}
