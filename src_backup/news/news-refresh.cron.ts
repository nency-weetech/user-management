import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { NewsQueueService } from "./news.queue.service";

@Injectable()
export class NewsRefreshCorn{
    constructor(private newsQueueService : NewsQueueService){}

    @Cron('30 12 * * *')
    async autoRefresh(){
        await this.newsQueueService.queueNewsFetch('technology', 10, null)
    }
}