import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { type Cache } from 'cache-manager';

@Injectable()
export class RateLimitService {
    constructor(@Inject(CACHE_MANAGER) private cacheManager : Cache ){}

    async checkLoginAttempt(email: string){
        const key = `login_attempts:${email}`
        const attempts = (await this.cacheManager.get<number>(key)) || 0;

        if(attempts >= 5){
            throw new BadRequestException('Too many login attempts. Try again in a few minutes.');
        }

        await this.cacheManager.set(key, attempts + 1, 300000)

    }

    async resetAttempts(email: string){
        await this.cacheManager.del(`login_attempts:${email}`)
    }
}
