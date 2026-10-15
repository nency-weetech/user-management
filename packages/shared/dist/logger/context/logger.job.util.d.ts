interface runJobOption {
    jobName: string;
    queueName?: string;
    jobId?: string;
    attempt?: number;
}
export declare function runWithJobContext<T>(options: runJobOption, fn: () => Promise<T> | T): Promise<T>;
export {};
//# sourceMappingURL=logger.job.util.d.ts.map