import { BaseInterfaceRepository } from "../common/base.interface";
import { NewsFetchLog } from "../entities/news-fetch-log.entity";
export interface NewsFetchLogInterfaceRepo extends BaseInterfaceRepository<NewsFetchLog> {
    findRecent(limit: number): Promise<NewsFetchLog[]>;
    countFailuersSince(date: Date): Promise<number>;
    getStats(sinceDate: Date): any;
}
