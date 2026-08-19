import {
  PaymentRepository,
  PaymentStatus,
  UserPlanRepository,
} from '@myapp/database';
import { runWithJobContext } from '@myapp/shared';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Processor('billingQueue')
export class PaymentEventProcessor extends WorkerHost {
  constructor(
    private paymentsRepo: PaymentRepository,
    private userPlanRepo: UserPlanRepository,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {
    super();
    this.logger.log('PaymentEventProcessor initialized');
  }

  async process(job: Job<any, any, string>) {
    return runWithJobContext(
      {
        jobName: job.name,
        jobId: job.id,
        queueName: 'billingQueue',
        attempt: job.attemptsMade,
      },
      async () => {
        this.logger.log(`Processing Billing job: ${job.name}`);
        switch (job.name) {
          case 'process-payment-event':
            return this.handlePaymentEvent(job);
          default:
            this.logger.warn(`Unknown job type: ${job.name}`);
        }
      },
    );
  }

  async handlePaymentEvent(job: Job) {
    const { eventType, sessionId, userId, paymentIntentId, plan , hostedInvoiceUrl} = job.data;

    const payment = await this.paymentsRepo.findBySessionId(sessionId);
    if (!payment) return;

    if (eventType === 'completed') {
      if (payment.status === PaymentStatus.SUCCEEDED) return;
      await this.paymentsRepo.markSucceeded(sessionId, paymentIntentId);
      await this.userPlanRepo.upgradeToPaid(userId, plan);
      this.logger.log(`Payment completed`);
    }

    if (eventType === 'expired') {
      if (payment.status !== PaymentStatus.PENDING) return;
      await this.paymentsRepo.markExpired(sessionId);
      this.logger.warn(`Payment expired`);
    }
  }
}
