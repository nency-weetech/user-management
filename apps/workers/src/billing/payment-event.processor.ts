import {
  OrganizationPlan,
  OrganizationPlanRepository,
  PaymentRepository,
  Payments,
  PaymentStatus,
  UserPlan,
  UserPlanRepository,
} from '@myapp/database';
import { runWithJobContext } from '@myapp/shared';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { json } from 'stream/consumers';
import { DataSource } from 'typeorm';

@Processor('billingQueue')
export class PaymentEventProcessor extends WorkerHost {
  constructor(
    private paymentsRepo: PaymentRepository,
    private userPlanRepo: UserPlanRepository,
    private orgPlanRepo: OrganizationPlanRepository,
    private dataSource : DataSource,
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

    if (eventType === 'completed') {
      if (payment.status === PaymentStatus.SUCCEEDED) return;

      await this.dataSource.transaction(async (manager) => {
        //await this.paymentsRepo.markSucceeded(paymentIntentId);
        await manager.update(Payments,
          {stripe_payment_intent_id: paymentIntentId},
          {status: PaymentStatus.SUCCEEDED}
        )
        if(targetType === 'organization'){
          await manager.update(OrganizationPlan,
            {organization_id: identifierId},
            {plan, plan_upgraded_at: new Date()}
          )
          //await this.orgPlanRepo.upgradeToPlan(identifierId, plan)
        }else{
          await manager.update(UserPlan, 
            {user_id : identifierId},
            {plan, plan_upgraded_at: new Date()}
          )
          //await this.userPlanRepo.upgradeToPaid(identifierId, plan);
        }

        const stripeClearing = await manager.query(
          `select id from pgledger_accounts where name = $1`, 
          ['stripe_clearing']
        );

        const salesRevenue = await manager.query(
          `select id from pgledger_accounts where name = $1`,
          ['sales_revenue']
        )

        const amountInRs = Number(payment.amount) / 100;

        await manager.query(
          `select * from pgledger_create_transfer($1, $2, $3, $4, $5)`,
          [
            stripeClearing[0].id,
            salesRevenue[0].id,
            amountInRs,
            new Date(job.data.eventCreatedAt ?? Date.now()),
            JSON.stringify({
              payment_id : payment.id,
              plan : payment.plan,
              target_type  : payment.organization_id ? 'ORG' : "USER"
            })
          ]
        );
      });

      this.logger.log(`Payment completed`);
    }

    if (eventType === 'failed') {
      if (payment.status !== PaymentStatus.PENDING) return;
      await this.paymentsRepo.markExpired(paymentIntentId);
      this.logger.warn(`Payment failed`);
    }
  }
}
