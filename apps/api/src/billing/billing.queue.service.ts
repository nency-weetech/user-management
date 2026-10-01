import { UserPlanEnum } from '@myapp/database';
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
    identifierId?: string,
    paymentIntentId?: string,
    planId?: string,
    targetType: 'user' | 'organization' = 'user',
  ) {
    const isTest = process.env.NODE_ENV === 'test';
    const job = await this.billingQueue.add(
      'process-payment-event',
      {
        eventType,
        identifierId,
        paymentIntentId,
        planId,
        targetType,
      },
      {
        attempts: isTest ? 1 : 3,
        backoff: isTest ? undefined : { type: 'exponential', delay: 3000 },
        removeOnComplete: false,
        removeOnFail: false,
      },
    );

    this.logger.log(
      `Payment event queued: event-type=${eventType},  identifierId=${identifierId} `,
    );
    return { jobId: job.id };
  }

  async queueInvoiceCreation(paymentIntentId: string) {
    return this.billingQueue.add(
      'create-invoice',
      { paymentIntentId },
      {
        jobId: `invoice-${paymentIntentId}`, // duplicate webhook se double job nahi
        attempts: 5,
        backoff: { type: 'exponential', delay: 3000 },
        removeOnComplete: false,
        removeOnFail: false,
      },
    );
  }

  async queueInvoiceSync(invoiceId: string, eventId: string) {
    return this.billingQueue.add(
      'sync-invoice',
      { invoiceId },
      {
        jobId: `evt-${eventId}`,
        attempts: 5,
        backoff: { type: 'exponential', delay: 3000 },
        removeOnComplete: false,
        removeOnFail: false,
      },
    );
  }
}
