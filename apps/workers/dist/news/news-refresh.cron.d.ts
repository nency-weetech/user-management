import { NewsQueueService } from "@myapp/api";
export declare class NewsRefreshCorn {
    private newsQueueService;
    constructor(newsQueueService: NewsQueueService);
    autoRefresh(): Promise<void>;
}
