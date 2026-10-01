import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import Stripe from 'stripe';
import { Payments } from '@myapp/database';
import { Plans_catalog } from '@myapp/database';
import { PlanType } from '@myapp/database';

@Injectable()
export class StripeInvoiceService {
  private stripe: Stripe;

  constructor(private dataSource: DataSource) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  retrieveInvoice(id: string): Promise<Stripe.Invoice> {
    return this.stripe.invoices.retrieve(id);
  }

  async issueInvoiceForPayment(payment: Payments): Promise<Stripe.Invoice> {
    const payments = this.dataSource.getRepository(Payments);

    const pi = await this.stripe.paymentIntents.retrieve(
      payment.stripe_payment_intent_id,
    );
    if (pi.status !== 'succeeded')
      throw new Error(`PI ${pi.id} is ${pi.status}`);

    const customerId =
      typeof pi.customer === 'string' ? pi.customer : pi.customer?.id;
    if (!customerId) throw new Error(`PI ${pi.id} has no customer`);

    const plan = await this.dataSource
      .getRepository(Plans_catalog)
      .findOne({ where: { id: payment.plan_id } });
    if (!plan || plan.name === PlanType.FREE) throw new Error('Invalid plan');

    let invoice: Stripe.Invoice;
    if (payment.stripe_invoice_id) {
      invoice = await this.stripe.invoices.retrieve(payment.stripe_invoice_id);
    } else {
      invoice = await this.stripe.invoices.create(
        {
          customer: customerId,
          collection_method: 'charge_automatically',
          auto_advance: false,
          pending_invoice_items_behavior: 'exclude',
          currency: pi.currency,
          metadata: { paymentId: payment.id, planId: plan.id },
        },
        { idempotencyKey: `inv-create-${payment.id}` }, // key sirf yahin
      );
      await payments.update(payment.id, { stripe_invoice_id: invoice.id });
    }

    if (invoice.status === 'draft') {
      if (invoice.lines.data.length === 0) {
        await this.stripe.invoiceItems.create({
          customer: customerId,
          invoice: invoice.id,
          amount: pi.amount,
          currency: pi.currency,
          description: `${plan.name.toUpperCase()} Plan`,
        });
      }
      invoice = await this.stripe.invoices.finalizeInvoice(invoice.id, {
        auto_advance: false,
      });
    }

    if (invoice.status === 'open') {
      invoice = await this.stripe.invoices.attachPayment(invoice.id, {
        payment_intent: pi.id,
      });
    }

    if (invoice.status !== 'paid') {
      throw new Error(`Invoice ${invoice.id} ended as ${invoice.status}`);
    }
    return invoice;
  }
}
