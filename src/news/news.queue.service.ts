import { InjectQueue } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { Queue } from "bullmq";

@Injectable()
export class NewsQueueService {
    private logger = new Logger(NewsQueueService.name);

    constructor(@InjectQueue('newsQueue') private readonly newsQueue: Queue){}

    async queueNewsFetch(query: string, number: number, triggeredByUserId: string |null = null ){
        const job = await this.newsQueue.add(
            'fetch-news',
            {query, number, triggeredByUserId},
            {
                attempts: 3,
                backoff: {type : 'exponential', delay: 3000},
                removeOnComplete: false,
                removeOnFail: false
            }
        );
        
        this.logger.log(`News fetch job queued: query="${query}", number=${number}`);
        return {jobId : job.id}
    }   
}