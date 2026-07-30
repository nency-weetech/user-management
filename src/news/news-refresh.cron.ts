import { Injectable } from "@nestjs/common";
import { NewsFetcherService } from "./news-fetcher.service";
import { Cron } from "@nestjs/schedule";

@Injectable()
export class NewsRefreshCorn{
    constructor(private newFetcherService : NewsFetcherService){}

    @Cron('55 17 * * *')
    async autoRefresh(){
        await this.newFetcherService.fetchAndStoreNews('technology', 10)
    }
}