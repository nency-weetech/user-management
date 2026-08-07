import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { error } from 'console';

@Injectable()
export class NewsQueueService {
  private logger = new Logger(NewsQueueService.name);

  constructor(@InjectQueue('newsQueue') private readonly newsQueue: Queue) {}
  
  
  async queueNewsFetch(
    query: string,
    number: number,
    triggeredByUserId: string | null = null,
  ) {
    const isTest = process.env.NODE_ENV === 'test';
    const job = await this.newsQueue.add(
      'fetch-news',
      { query, number, triggeredByUserId },
      {
        attempts: isTest ? 1 : 3,
        backoff: isTest ? undefined : { type: 'exponential', delay: 3000 },
        removeOnComplete: false,
        removeOnFail: false,
      },
    );
    if (!query || query.trim() === '') {
      throw new BadRequestException('Query is required and cannot be empty');
    }

    this.logger.log(
      `News fetch job queued: query="${query}", number=${number}`,
    );
    return { jobId: job.id };
  }

  async getJobState(jobId: string) {
    const job = await this.newsQueue.getJob(jobId);
    if (!job) {
      throw new NotFoundException(`job with id ${jobId} not found`);
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
          jobName: job.name,
          failedReason: job.failedReason,
          error: job.failedReason,
          attemptsMade: job.attemptsMade,
          failedAt: job.finishedOn,
        };
      case 'active':
        return {
          success: null,
          status: 'Active',
          message: 'News fetch is curently process',
          jobId: job.id,
        };
      case 'waiting':
      case 'delayed':
        return {
          success: null,
          status: state,
          message: 'News fetch job is queued and waiting to be processed',
          jobId: job.id,
        };
      default:
        return {
          success: null,
          status: state,
          message: `Job is in ${state} stage`,
          jobId: job.id,
        };
    }
  }

  async getFailedJobs() {
    try {
      const failedJob = await this.newsQueue.getJobs(['failed']);

      return failedJob.map((job) => ({
        jobId: job.id,
        query: job.data.query,
        number: job.data.number,
        failedReason: job.failedReason,
        attemptsMade: job.attemptsMade,
        failedAt: job.finishedOn
          ? new Date(job.finishedOn).toISOString()
          : null,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Unknown Internal Server Error';
      if (errorMessage.includes('401') || errorMessage.includes('403')) {
        throw new InternalServerErrorException(
          'News API authentication failed - check API Key configuration',
        );
      }
      if (errorMessage.includes('429')) {
        throw new InternalServerErrorException(
          'News API rate limit exceeded - Wait and retry later',
        );
      }
      if (
        errorMessage.includes('ECONNREFUSED') ||
        errorMessage.includes('ETIMEOUT')
      ) {
        throw new InternalServerErrorException(
          'Could not connect to News API - network or server issue',
        );
      }
      throw new InternalServerErrorException(
        `Failed to fetch news data : ${errorMessage}`,
      );
    }
  }

  async retryFaildJob(jobId: string) {
    const job = await this.newsQueue.getJob(jobId);
    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} Not found`);
    }

    const state = await job.getState();
    if (state !== 'failed') {
      `Job ${jobId} is not in "failed" state (current: ${state}). Only failed jobs can be retried.`;
    }

    await job.retry();
    this.logger.log(`Job ${jobId} manually retried`);

    return {
      message: `Job ${jobId} has been re-queued for processing`,
      jobId: job.id,
    };
  }
}
