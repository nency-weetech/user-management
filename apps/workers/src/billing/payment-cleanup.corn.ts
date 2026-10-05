import { Payments, PaymentRepository } from '@myapp/database';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { StripeInvoiceService } from './stripe-invoice.service';

// test ke liye env se badal sakte ho
const STALE_AFTER_MS = Number(process.env.PENDING_PAYMENT_TTL_MS ?? 30 * 60 * 1000);

@Injectable()
export class PaymentCleanUpCron {
  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly stripeService: StripeInvoiceService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async cleanupStalePendingPayments() {
    const cutoff = new Date(Date.now() - STALE_AFTER_MS);
    const stale = await this.paymentRepo.findStalePending(cutoff);
    let expired = 0;

    for (const payment of stale) {
      try {
        if (await this.expireOne(payment)) expired++;
      } catch (err) {
        this.logger.error(`Cleanup failed for payment ${payment.id}: ${err.message}`);
      }
    }
    this.logger.log(`Stale pending payments: ${stale.length} found, ${expired} expired`);
  }

  private async expireOne(payment: Payments): Promise<boolean> {
    if (payment.stripe_invoice_id) {
      const invoice = await this.stripeService.retrieveInvoice(payment.stripe_invoice_id);

      if (invoice.status === 'paid') {
        this.logger.warn(`Invoice ${invoice.id} is paid but payment ${payment.id} is still PENDING`);
        return false;
      }

      if (invoice.status === 'open') {
        const piStatus = await this.stripeService.getPaymentIntentStatus(
          payment.stripe_payment_intent_id,
        );
        if (piStatus === 'processing' || piStatus === 'succeeded') return false;

        await this.stripeService.voidInvoice(invoice.id);
      }
    }

    return this.paymentRepo.markExpired(payment.stripe_payment_intent_id);
  }
}