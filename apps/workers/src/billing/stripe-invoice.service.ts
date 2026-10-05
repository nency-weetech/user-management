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

  voidInvoice(id: string):Promise<Stripe.Invoice> {
    return this.stripe.invoices.voidInvoice(id);
  }

  async getPaymentIntentStatus(id: string) :Promise<Stripe.Invoice.Status> {
    const pi = await this.stripe.paymentIntents.retrieve(id);
    return pi.status;
  }
}
