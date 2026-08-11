import { Queue } from 'bullmq';
export declare class NewsQueueService {
    private readonly newsQueue;
    private logger;
    constructor(newsQueue: Queue);
    queueNewsFetch(query: string, number: number, triggeredByUserId?: string | null): Promise<{
        jobId: string;
    }>;
    getJobState(jobId: string): Promise<{
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
    getFailedJobs(): Promise<{
        jobId: string;
        query: any;
        number: any;
        failedReason: string;
        attemptsMade: number;
        failedAt: string;
    }[]>;
    retryFaildJob(jobId: string): Promise<{
        message: string;
        jobId: string;
    }>;
}
