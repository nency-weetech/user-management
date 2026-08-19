import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class BillingQueueService {
  private logger = new Logger(BillingQueueService.name);

  constructor(
    @InjectQueue('billingQueue') private readonly billingQueue: Queue,
  ) {}

  async queuePaymentUpdate(
    eventType: string,
    sessionId: string,
    userId?: string,
    paymentIntentId?: string,
  ) {
    const isTest = process.env.NODE_ENV === 'test';
    const job = await this.billingQueue.add(
      'process-payment-event',
      {
        eventType,
        sessionId,
        userId,
        paymentIntentId,
      },
      {
        attempts: isTest ? 1 : 3,
        backoff: isTest ? undefined : { type: 'exponential', delay: 3000 },
        removeOnComplete: false,
        removeOnFail: false,
      },
    );

    this.logger.log(
      `Payment event queued: event-type=${eventType}, sessionId=${sessionId}, userId=${userId} `,
    );
    return { jobId: job.id };
  }
}
