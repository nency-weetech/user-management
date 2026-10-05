import { PaymentRepository, Payments, UserPlanEnum } from '@myapp/database';
import { Plans_catalog } from '@myapp/database/dist/entities/plans.entity';
import { PlanTargetType } from '@myapp/database/dist/enums/plan-target-type.enum';
import { PlanType } from '@myapp/database/dist/enums/plan.enum';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Repository } from 'typeorm';
import { AmountBreakdown, TAX_RATE_PERCENT } from './pricing.util';

export interface PlanInvoiceResult {
  invoiceId: string;
  paymentIntentId: string;
  clientSecret: string;
}
@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    @InjectRepository(Plans_catalog)
    private planCatelogRepository: Repository<Plans_catalog>,
    private paymentRepo: PaymentRepository,
  ) {
    // this.stripe = new Stripe(this.configService.get<string>(STRIPE_SECRET_KEY));
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  async createCheckoutSession(
    userId: string,
    email: string,
    plan: UserPlanEnum,
  ): Promise<Stripe.Checkout.Session> {
    const priceId =
      plan === 'pro'
        ? process.env.STRIPE_PRO_PRICE_ID
        : process.env.STRIPE_MAX_PRICE_ID;
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      metadata: { userId, plan },
      customer_email: email,
      invoice_creation: { enabled: true },
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL,
    });
    return session;
  }

  verifyWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    return this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret,
    );
  }

  async getInvoiceUrl(invoiceId: string) {
    const invoice = await this.stripe.invoices.retrieve(invoiceId);

    return {
      hostedInvoiceUrl: invoice.hosted_invoice_url,
      invoicePDF: invoice.invoice_pdf,
    };
  }

  async createPaymentIntent(
    planId: string,
    identifierId: string,
    targetType: PlanTargetType,
    stripeCustomerId: string,
  ): Promise<Stripe.PaymentIntent> {
    const plan = await this.planCatelogRepository.findOne({
      where: { id: planId, target_type: targetType },
    });
    if (!plan) throw new BadRequestException('Invalid plan');
    if (plan.name === PlanType.FREE) {
      throw new BadRequestException('Cannot create payment for FREE plan');
    }

    const metadata =
      targetType === PlanTargetType.ORGANIZATION
        ? { organizationId: identifierId, planId: plan.id }
        : { userId: identifierId, planId: plan.id };

    return this.stripe.paymentIntents.create({
      amount: Math.round(plan.price * 100),
      currency: plan.currency.toLowerCase(),
      customer: stripeCustomerId,
      metadata,
      automatic_payment_methods: { enabled: true },
    });
  }

  async findByPaymentIntentId(paymentIntentId: string) {
    return this.paymentRepo.findOne({
      where: {
        stripe_payment_intent_id: paymentIntentId,
      },
      relations: {
        plan: true,
        user: true,
        organization: true,
      },
    });
  }

  async createCustomer(params: {
    email: string;
    name?: string;
    metadata: Record<string, string>;
  }): Promise<string> {
    const customer = await this.stripe.customers.create(params);
    return customer.id;
  }

  async createPlanInvoice(params: {
    customerId: string; // dono case mein PAYING USER ka Stripe customer
    plan: Plans_catalog;
    breakdown: AmountBreakdown;
    couponCode: string | null;
    targetType: PlanTargetType; // USER ya ORGANIZATION
    targetId: string; // userId ya orgId
    payerUserId: string; // jo user pay kar raha hai
    billedTo?: string;
  }): Promise<PlanInvoiceResult> {
    const {
      customerId,
      plan,
      breakdown,
      couponCode,
      targetType,
      targetId,
      payerUserId,
      billedTo,
    } = params;
    const currency = plan.currency.toLowerCase();

    const isOrg = targetType === PlanTargetType.ORGANIZATION;
    const metadata: Record<string, string> = {
      planId: plan.id,
      targetType: String(targetType),
      payerUserId,
      ...(isOrg ? { organizationId: targetId } : { userId: targetId }),
    };
    const lines = [
      {
        kind: 'plan',
        description: `${plan.name.toUpperCase()} Plan`,
        amount: breakdown.subtotal,
      },
      {
        kind: 'discount',
        description: `Coupon discount (${couponCode})`,
        amount: -breakdown.discount,
      },
      {
        kind: 'tax',
        description: `Tax (${TAX_RATE_PERCENT})`,
        amount: +breakdown.tax,
      },
    ].filter((l) => l.amount !== 0);

    const invoice = await this.stripe.invoices.create({
      customer: customerId,
      collection_method: 'charge_automatically',
      auto_advance: false,
      pending_invoice_items_behavior: 'exclude',
      description: billedTo ? `Billed to: ${billedTo}` : undefined,
      metadata: { ...metadata, couponCode: couponCode ?? '' },
    });

    try {
      for (const line of lines) {
        await this.stripe.invoiceItems.create({
          customer: customerId,
          invoice: invoice.id,
          currency,
          amount: line.amount,
          description: line.description,
          metadata: { kind: line.kind },
        });
      }
      const draft = await this.stripe.invoices.retrieve(invoice.id);
      if (draft.total !== breakdown.total) {
        throw new Error(
          `Invoice total ${draft.total} != expected ${breakdown.total}`,
        );
      }

      const open = await this.stripe.invoices.finalizeInvoice(invoice.id, {
        auto_advance: false,
        expand: ['confirmation_secret'],
      });

      const clientSecret = open.confirmation_secret?.client_secret;
      if (!clientSecret)
        throw new Error(`Invoice ${open.id} has no client secret`);

      const paymentIntentId = clientSecret.split('_secret_')[0];
      await this.stripe.paymentIntents.update(paymentIntentId, {
        metadata: { ...metadata, invoiceId: open.id },
      });
      return { invoiceId: open.id, paymentIntentId, clientSecret };
    } catch (error) {
      await this.discardInvoice(invoice.id);
      throw error;
    }
  }

  async discardInvoice(invoiceId: string) {
    try {
      const inv = await this.stripe.invoices.retrieve(invoiceId);
      if (inv.status === 'draft') await this.stripe.invoices.del(invoiceId);
      else if (inv.status === 'open')
        await this.stripe.invoices.voidInvoice(invoiceId);
    } catch (e) {
      this.logger.error(`Could not discard invoice ${invoiceId}: ${e.message}`);
    }
  }
}
