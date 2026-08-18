import { AppService } from './app.service';
import { type Cache } from 'cache-manager';
export declare class AppController {
    private readonly appService;
    private cacheManager;
    constructor(appService: AppService, cacheManager: Cache);
    getHello(): string;
    testRedis(): Promise<{
        value: unknown;
    }>;
}
//# sourceMappingURL=app.controller.d.ts.map