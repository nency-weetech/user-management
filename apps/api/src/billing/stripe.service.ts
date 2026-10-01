import { PaymentRepository, Payments, UserPlanEnum } from '@myapp/database';
import { Plans_catalog } from '@myapp/database/dist/entities/plans.entity';
import { PlanTargetType } from '@myapp/database/dist/enums/plan-target-type.enum';
import { PlanType } from '@myapp/database/dist/enums/plan.enum';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Repository } from 'typeorm';

@Injectable()
export class StripeService {
  private stripe: Stripe;

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

  async createCustomer(email: string, ownerId: string, type: 'user' | 'org') {
    const c = await this.stripe.customers.create(
      { email, metadata: { ownerId, type } },
      { idempotencyKey: `cust-${type}-${ownerId}` },
    );
    return c.id;
  }

  async issueInvoiceForPayment(
    payment: Payments,
    stripeCustomerId: string,
  ): Promise<Stripe.Invoice> {
    const plan = await this.planCatelogRepository.findOne({
      where: { id: payment.plan_id },
    });
    if (!plan || plan.name === PlanType.FREE)
      throw new BadRequestException('Invalid plan');

    const key = (s: string) => ({ idempotencyKey: `${s}-${payment.id}` });

    const draft = await this.stripe.invoices.create(
      {
        customer: stripeCustomerId,
        collection_method: 'charge_automatically',
        auto_advance: false,
        pending_invoice_items_behavior: 'exclude',
        currency: plan.currency.toLowerCase(),
        metadata: { paymentId: payment.id, planId: plan.id },
      },
      key('inv-create'),
    );

    await this.stripe.invoiceItems.create(
      {
        customer: stripeCustomerId,
        invoice: draft.id,
        amount: Math.round(plan.price * 100),
        currency: plan.currency.toLowerCase(),
        description: `${plan.name.toUpperCase()} Plan`,
      },
      key('inv-item'),
    );

    const open = await this.stripe.invoices.finalizeInvoice(
      draft.id,
      { auto_advance: false },
      key('inv-finalize'),
    );

    return this.stripe.invoices.attachPayment(
      open.id,
      { payment_intent: payment.stripe_payment_intent_id },
      key('inv-attach'),
    );
  }
}
