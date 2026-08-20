import { UserPlanEnum } from '@myapp/database';
import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    // this.stripe = new Stripe(this.configService.get<string>(STRIPE_SECRET_KEY));
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  async createCheckoutSession(
    userId: string,
    email: string,
    plan : UserPlanEnum
  ): Promise<Stripe.Checkout.Session> {
    const priceId = plan === 'pro' ? process.env.STRIPE_PRO_PRICE_ID : process.env.STRIPE_MAX_PRICE_ID
    const session = await this.stripe.checkout.sessions.create({
        mode: 'payment',
        line_items : [
            {
                price: priceId,
                quantity: 1
            }
        ],
        expires_at: Math.floor(Date.now()/1000) + 30 * 60,
        metadata: {userId, plan},
        customer_email: email,
        invoice_creation: {enabled: true},
        success_url: process.env.STRIPE_SUCCESS_URL,
        cancel_url: process.env.STRIPE_CANCEL_URL,
    });
    return session;
  }

  verifyWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    return this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  }

  async getInvoiceUrl(invoiceId: string){
    const invoice = await this.stripe.invoices.retrieve(invoiceId);

    return { 
      hostedInvoiceUrl : invoice.hosted_invoice_url,
      invoicePDF : invoice.invoice_pdf
    }
  }
}
