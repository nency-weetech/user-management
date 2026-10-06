import { OnApplicationShutdown } from "@nestjs/common";
import { Browser } from "puppeteer";
export declare class BrowserService implements OnApplicationShutdown {
    private readonly logger;
    private browser?;
    private launching?;
    get(): Promise<Browser>;
    isUp(b: Browser): Promise<any>;
    launch(): Promise<Browser>;
    onApplicationShutdown(): Promise<void>;
}
//# sourceMappingURL=browser.service.d.ts.map