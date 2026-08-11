import { NewsService } from './news.service';
import { User } from '@myapp/database';
import { NewsFetchLogRepository } from '@myapp/database';
import { UpdateArticleDto } from './dtos/update-article.dto';
import { NewsQueueService } from './news.queue.service';
export declare class NewsController {
    private readonly newsService;
    private newsQueueService;
    private newsFetchLogRepository;
    constructor(newsService: NewsService, newsQueueService: NewsQueueService, newsFetchLogRepository: NewsFetchLogRepository);
    refreshNes(dto: {
        query: string;
        number?: number;
    }, admin: User): Promise<{
        status: number;
        jobId: string;
        message: string;
    }>;
    getFailedJobs(): Promise<{
        jobId: string;
        query: any;
        number: any;
        failedReason: string;
        attemptsMade: number;
        failedAt: string;
    }[]>;
    retryJob(jobId: string): Promise<{
        message: string;
        jobId: string;
    }>;
    getJobStatus(jobId: string): Promise<{
        success: boolean;
        status: string;
        message: string;
        jobId: string;
        result: any;
        jobName?: undefined;
        failedReason?: undefined;
        error?: undefined;
        attemptsMade?: undefined;
        failedAt?: undefined;
    } | {
        success: boolean;
        status: string;
        message: string;
        jobId: string;
        jobName: string;
        failedReason: string;
        error: string;
        attemptsMade: number;
        failedAt: number;
        result?: undefined;
    } | {
        success: any;
        status: string;
        message: string;
        jobId: string;
        result?: undefined;
        jobName?: undefined;
        failedReason?: undefined;
        error?: undefined;
        attemptsMade?: undefined;
        failedAt?: undefined;
    }>;
    fetchHistory(limit: number): Promise<import("@myapp/database").NewsFetchLog[]>;
    fetchStats(): Promise<{
        TotalFetches: number;
        FailedFetch: number;
        SuccessRate: string | number;
        AvgDurationMs: string;
    }>;
    findAll(page?: number, limit?: number, category?: string): Promise<{
        data: import("@myapp/database").Article[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPage: number;
        };
    }>;
    remove(id: string): Promise<{
        message: string;
        deleteArticle: void;
    }>;
    updateArticle(id: string, dto: UpdateArticleDto): Promise<import("@myapp/database").Article>;
}
