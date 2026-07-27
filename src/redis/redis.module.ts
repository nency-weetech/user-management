import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [{
        provide: 'REDIS_CLIENT',
        useFactory : (config : ConfigService) => {
            return new Redis({
                host: config.get('REDIS_HOST'),
                port: config.get('REDIS_PORT'),
            });
        },
        inject: [ConfigService],
    },],
    exports: ['REDIS_CLIENT']
})
export class RedisModule {}
