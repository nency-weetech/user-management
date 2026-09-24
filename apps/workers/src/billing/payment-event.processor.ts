import {
  OrganizationPlanRepository,
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
    private orgPlanRepo: OrganizationPlanRepository,
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
            await this.handlePaymentEvent(job);
            break;
          default:
            this.logger.warn(`Unknown job type: ${job.name}`);
        }
      },
    );
  }

  async handlePaymentEvent(job: Job) {
    const { eventType, identifierId, paymentIntentId, plan, targetType } = job.data;

    const payment = await this.paymentsRepo.findByPaymentIntentId(paymentIntentId);

    if (!payment) return;

    console.log(eventType)
    if (eventType === 'completed') {
      if (payment.status === PaymentStatus.SUCCEEDED) return;
      await this.paymentsRepo.markSucceeded(paymentIntentId);

      if(targetType === 'organization'){
        await this.orgPlanRepo.upgradeToPlan(identifierId, plan)
      }else{
        await this.userPlanRepo.upgradeToPaid(identifierId, plan);
      }
      this.logger.log(`Payment completed`);
    }

    if (eventType === 'failed') {
      if (payment.status !== PaymentStatus.PENDING) return;
      await this.paymentsRepo.markExpired(paymentIntentId);
      this.logger.warn(`Payment failed`);
    }
  }
}
