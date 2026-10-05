import {
  OrganizationPlan,
  OrganizationPlanRepository,
  PaymentRepository,
  Payments,
  PaymentStatus,
  User,
  UserPlan,
  UserPlanRepository,
} from '@myapp/database';
import { Plans_catalog } from '@myapp/database/dist/entities/plans.entity';
import { runWithJobContext } from '@myapp/shared';
import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { json } from 'stream/consumers';
import { DataSource, Not } from 'typeorm';
import { StripeInvoiceService } from './stripe-invoice.service';

@Processor('billingQueue')
export class PaymentEventProcessor extends WorkerHost {
  constructor(
    private paymentsRepo: PaymentRepository,
    private userPlanRepo: UserPlanRepository,
    private orgPlanRepo: OrganizationPlanRepository,
    private dataSource: DataSource,
    private stripeService: StripeInvoiceService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    @InjectQueue('mailQueue') private mailQueue: Queue,
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
          case 'sync-invoice':
            await this.handleSyncInvoice(job);
            break;
          default:
            this.logger.warn(`Unknown job type: ${job.name}`);
        }
      },
    );
  }

  async handlePaymentEvent(job: Job) {
    const { eventType, identifierId, paymentIntentId, planId, targetType } =
      job.data;

    const payment =
      await this.paymentsRepo.findByPaymentIntentId(paymentIntentId);

    if (!payment) return;

    if (eventType === 'completed') {
      if (payment.status === PaymentStatus.SUCCEEDED) return;

      await this.dataSource.transaction(async (manager) => {
        const claim = await manager.update(
          Payments,
          {
            stripe_payment_intent_id: paymentIntentId,
            status: Not(PaymentStatus.SUCCEEDED),
          },
          {
            status: PaymentStatus.SUCCEEDED,
            plan_id: planId,
          },
        );
        if (!claim.affected) return;

        if (targetType === 'organization') {
          await manager.update(
            OrganizationPlan,
            { organization_id: identifierId },
            {
              plan_id: planId,
              plan_upgraded_at: new Date(),
            },
          );
        } else {
          await manager.update(
            UserPlan,
            { user_id: identifierId },
            {
              plan_id: planId,
              plan_upgraded_at: new Date(),
            },
          );
        }

        const stripeClearing = await manager.query(
          `SELECT id FROM pgledger_accounts WHERE name = $1`,
          ['stripe_clearing'],
        );

        const salesRevenue = await manager.query(
          `SELECT id FROM pgledger_accounts WHERE name = $1`,
          ['sales_revenue'],
        );

        const amountInRs = Number(payment.amount) / 100;

        await manager.query(
          `SELECT * FROM pgledger_create_transfer($1, $2, $3, $4, $5)`,
          [
            stripeClearing[0].id,
            salesRevenue[0].id,
            amountInRs,
            new Date(job.data.eventCreatedAt ?? Date.now()),
            JSON.stringify({
              payment_id: payment.id,
              plan_id: planId,
              target_type: payment.organization_id ? 'ORG' : 'USER',
            }),
          ],
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

  async handleSyncInvoice(job: Job) {
    const invoice = await this.stripeService.retrieveInvoice(
      job.data.invoiceId,
    );

    const repo = this.dataSource.getRepository(Payments);
    const payment = await repo.findOne({
      where: { stripe_invoice_id: invoice.id },
    });

    if (!payment) {
      this.logger.warn(`No payment row yet for invoice ${invoice.id}`);
      return;
    }

    await repo.update(payment.id, { invoice_status: invoice.status });
    if (invoice.status !== 'paid') return;

    const payerId = invoice.metadata?.payerUserId;
    const payer = payerId
      ? await this.dataSource
          .getRepository(User)
          .findOne({ where: { id: payerId } })
      : null;

    const toEmail = payer?.email ?? invoice.customer_email;

    if (!toEmail || !invoice.hosted_invoice_url) {
      this.logger.warn(
        `Invoice ${invoice.id}: email or url missing, mail skipped`,
      );
      return;
    }

    await this.mailQueue.add(
      'send-invoice-email',
      {
        toEmail: invoice.customer_email,
        hostedInvoiceUrl: invoice.hosted_invoice_url,
        invoicePDF: invoice.invoice_pdf,
      },
      {
        jobId: `invoice-mail-${invoice.id}`,
        attempts: 5,
        backoff: { type: 'exponential', delay: 3000 },
        removeOnComplete: false,
        removeOnFail: false,
      },
    );
  }
}
