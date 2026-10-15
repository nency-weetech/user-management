import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { NewsQueueService } from "@myapp/api";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";

@Injectable()
export class NewsRefreshCorn{
    constructor(private newsQueueService : NewsQueueService, @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger){}

    @Cron('30 12 * * *')
    async autoRefresh(){
        await this.newsQueueService.queueNewsFetch('technology', 10, null)
    }
}