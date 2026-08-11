import { BaseAbstractRepostitory } from '../common/base.repository';
import { NewsFetchLogInterfaceRepo } from '../interfaces/news-fetch-log.interface.repository';
import { NewsFetchLog } from '../entities/news-fetch-log.entity';
import { Repository } from 'typeorm';
export declare class NewsFetchLogRepository extends BaseAbstractRepostitory<NewsFetchLog> implements NewsFetchLogInterfaceRepo {
    private newsFetchLogRepository;
    constructor(newsFetchLogRepository: Repository<NewsFetchLog>);
    findRecent(limit: number): Promise<NewsFetchLog[]>;
    countFailuersSince(date: Date): Promise<number>;
    getStats(sinceDate: Date): Promise<{
        TotalFetches: number;
        FailedFetch: number;
        SuccessRate: string | number;
        AvgDurationMs: string;
    }>;
}
