import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class NewsQueueService {
  private logger = new Logger(NewsQueueService.name);

  constructor(@InjectQueue('newsQueue') private readonly newsQueue: Queue) {}

  async queueNewsFetch(
    query: string,
    number: number,
    triggeredByUserId: string | null = null,
  ) {
    const job = await this.newsQueue.add(
      'fetch-news',
      { query, number, triggeredByUserId },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 3000 },
        removeOnComplete: false,
        removeOnFail: false,
      },
    );

    this.logger.log(
      `News fetch job queued: query="${query}", number=${number}`,
    );
    return { jobId: job.id };
  }

  async getJobState(jobId: string) {
    const job = await this.newsQueue.getJob(jobId);
    if (!job) {
      return { message: 'not found' };
    }

    const state = await job.getState();
    switch (state) {
      case 'completed':
        return {
          success: true,
          status: 'Completed',
          message: 'News fetch completed successfully',
          jobId: job.id,
          result: job.returnvalue,
        };
      case 'failed':
        return {
          success: false,
          status: 'Failed',
          message: 'News fetch failed after all retry attempts',
          jobId: job.id,
          jobName : job.name,
          failedReason : job.failedReason,
          error: job.failedReason,
          attemptsMade: job.attemptsMade,
          failedAt: job.finishedOn
        };
      case 'active' :
        return {
            success : null,
            status : 'Active',
            message : 'News fetch is curently process',
            jobId: job.id
        }
      case 'waiting':
      case 'delayed' :
        return {
            success : null,
            status : state,
            message : 'News fetch job is queued and waiting to be processed',
            jobId : job.id
        }
      default:
        return {
            success : null,
            status : state,
            message :  `Job is in ${state} stage`,
            jobId : job.id
        }
    };
  }

  async retryFaildJob(jobId : string){
    const job = await this.newsQueue.getJob(jobId)
    if(!job){
      throw new NotFoundException(`Job with ID ${jobId} Not found`)
    }

    const state = await job.getState()
    if(state !== 'failed'){
      `Job ${jobId} is not in "failed" state (current: ${state}). Only failed jobs can be retried.`
    }

    await job.retry()
    this.logger.log(`Job ${jobId} manually retried`);

    return {
      message: `Job ${jobId} has been re-queued for processing`,
      jobId: job.id,
    };
  }
}
