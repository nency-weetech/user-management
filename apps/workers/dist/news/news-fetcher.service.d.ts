import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ArticleRepository } from '@myapp/database';
import { NewsFetchLogRepository } from '@myapp/database';
export declare class NewsFetcherService {
    private httpService;
    private config;
    private articalRepository;
    private newFetchLogRepository;
    constructor(httpService: HttpService, config: ConfigService, articalRepository: ArticleRepository, newFetchLogRepository: NewsFetchLogRepository);
    fetchAndStoreNews(query: string, number: number, triggeredByUserId?: string | null): Promise<{
        fetched: number;
    }>;
}
