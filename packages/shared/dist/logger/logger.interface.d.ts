export interface HttpContextData {
    type: 'http';
    reqId: string;
    method: string;
    url: string;
    userId?: string;
    userAgent?: string;
    ip?: string;
}
export interface JobContextData {
    type: 'job';
    jobId: string;
    jobName: string;
    queueName?: string;
    attempt?: number;
}
export type ContextData = HttpContextData | JobContextData;
export interface LogEntry {
    timestamp: string;
    level: string;
    message: string;
    service: string;
    function?: string;
    context?: ContextData;
    meta?: Record<string, any>;
    stack?: string;
}
//# sourceMappingURL=logger.interface.d.ts.map