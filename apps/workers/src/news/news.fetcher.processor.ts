import { Processor, WorkerHost } from '@nestjs/bullmq';
import { BadRequestException, Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { NewsFetcherService } from './news-fetcher.service';
import {  runWithJobContext } from '@myapp/shared';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Processor('newsQueue', {
  concurrency: 3,
  limiter: {
    max: 6,
    duration: 10000,
  },
})
export class NewsProcessor extends WorkerHost {
  constructor(private newsFetcherService: NewsFetcherService, @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger) {
    super();
   
  }

  async process(job: Job<any, any, string>) {
    return runWithJobContext({
      jobName: job.name,
      jobId: job.id,
      queueName: 'NewsQueue',
      attempt: job.attemptsMade
    }, 
    async () => {
      this.logger.log(`Processing news job: ${job.name}`);
    switch (job.name) {
      case 'fetch-news':
        return this.handlenewsFetch(job);
      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
    }
    }
  )
  }

  async handlenewsFetch(
    job: Job<{
      query: string;
      number: number;
      triggeredByUserId: string | null;
    }>,
  ) {
    const { query, number, triggeredByUserId } = job.data;

    const result = await this.newsFetcherService.fetchAndStoreNews(
      query,
      number,
      triggeredByUserId,
    );

    this.logger.log(
      `News fetched: ${result.fetched} articles for "${query}"`,
    );
    return result;
  }
}
