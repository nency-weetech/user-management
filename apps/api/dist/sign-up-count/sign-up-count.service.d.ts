import Redis from 'ioredis';
export declare class SignUpCountService {
    private redis;
    constructor(redis: Redis);
    private readonly counterKey;
    incrSignUpCount(): Promise<void>;
    getSignUpCount(): Promise<number>;
    resetSignUpCount(): Promise<void>;
}
