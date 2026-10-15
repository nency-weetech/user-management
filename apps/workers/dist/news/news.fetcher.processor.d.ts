import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { NewsFetcherService } from './news-fetcher.service';
export declare class NewsProcessor extends WorkerHost {
    private newsFetcherService;
    private logger;
    constructor(newsFetcherService: NewsFetcherService);
    process(job: Job<any, any, string>): Promise<{
        fetched: number;
    }>;
    handlenewsFetch(job: Job<{
        query: string;
        number: number;
        triggeredByUserId: string | null;
    }>): Promise<{
        fetched: number;
    }>;
}
