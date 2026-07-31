import { Injectable } from "@nestjs/common";
import { NewsFetcherService } from "./news-fetcher.service";
import { Cron } from "@nestjs/schedule";
import { NewsFetchLogRepository } from "./news-fetch-log.repository";

@Injectable()
export class NewsRefreshCorn{
    constructor(private newFetcherService : NewsFetcherService, private newsFetchLogRepository : NewsFetchLogRepository){}

    @Cron('30 12 * * *')
    async autoRefresh(){
        await this.newFetcherService.fetchAndStoreNews('technology', 10)
    }
}