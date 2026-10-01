import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import {
  OrganizationPlanEnum,
  OrganizationPlanRepository,
  OrganizationRepository,
  ORGANIZATIOPN_PLAN_CONFIG,
  PaymentRepository,
  PaymentStatus,
  PLAN_CONFIG,
  User,
  UserPlanEnum,
  UserPlanRepository,
  UserRepository,
  UserRole,
} from '@myapp/database';
import { AuthGuard } from '../guards/auth/auth.guard';
import { currentUser } from '../decorators/current-user.decorator';
import { Request } from 'express';
import { BillingQueueService } from './billing.queue.service';
import { MailService } from '../mail/mail.service';
import { RoleGuard } from '../guards/role/role.guard';
import { Roles } from '../decorators/role.decorator';
import { OrganizationService } from '../organization/organization.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Plans_catalog } from '@myapp/database/dist/entities/plans.entity';
import { Repository } from 'typeorm';
import { PlanTargetType } from '@myapp/database/dist/enums/plan-target-type.enum';
import { PlanType } from '@myapp/database/dist/enums/plan.enum';

@Controller('billing')
export class BillingController {
  constructor(
    private stripeService: StripeService,
    private paymentRepository: PaymentRepository,
    private userPlanRepo: UserPlanRepository,
    private billingQueueService: BillingQueueService,
    private organizationService: OrganizationService,
    private orgRepo: OrganizationRepository,
    private orgPlanRepo: OrganizationPlanRepository,
    private mailService: MailService,
    private userRepository: UserRepository,
    @InjectRepository(Plans_catalog)
    private planCatelogRepository: Repository<Plans_catalog>,
  ) {}

  @Post('checkout/:planId')
  @UseGuards(AuthGuard)
  async checkout(@currentUser() user: User, @Param('planId') planId: string) {
    const plan = await this.planCatelogRepository.findOne({
      where: {
        id: planId,
        target_type: PlanTargetType.USER,
      },
    });
    if (!plan) {
      throw new BadRequestException('Invalid plan');
    }

    if (plan.name === PlanType.FREE) {
      throw new BadRequestException('Cannot checkout for FREE plan');
    }

    const userPlan = await this.userPlanRepo.findByUserId(user.id);
    if (userPlan?.plan?.name === PlanType.MAX) {
      return { message: 'You already have the upgraded version.' };
    }

    let cus = user.stripe_customer_id;
    if (!cus) {
      cus = await this.stripeService.createCustomer(
        user.email,
        user.id,
        'user',
      );
      await this.userRepository.updateStripeCustomerid(user.id, cus);
    }
    const paymentIntent = await this.stripeService.createPaymentIntent(
      planId,
      user.id,
      PlanTargetType.USER,
      cus,
    );

    const amountInPaise = plan.price * 100;

    await this.paymentRepository.createPayment(
      user.id,
      plan.id,
      paymentIntent.id,
      amountInPaise,
      plan.currency,
    );
    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  @Post('organizations/:orgId/checkout/:planId')
  @UseGuards(AuthGuard)
  async checkoutForOrganization(
    @currentUser() user: User,
    @Param('orgId') orgId: string,
    @Param('planId') planId: string,
  ) {
    const plan = await this.planCatelogRepository.findOne({
      where: {
        id: planId,
        target_type: PlanTargetType.ORGANIZATION,
      },
    });
    if (!plan) {
      throw new BadRequestException('Invalid plan');
    }

    if (plan.name === PlanType.FREE) {
      throw new BadRequestException('Cannot checkout for FREE plan');
    }

    const isOwner = await this.orgRepo.findIsAdmin(orgId, user.id);
    if (!isOwner) {
      throw new ForbiddenException(
        'Only the organization owner can upgrade the plan',
      );
    }

    const orgPlan = await this.orgPlanRepo.findByOrgId(orgId);
    if (orgPlan?.plan?.name === PlanType.MAX) {
      return { message: 'This organization already has the upgraded version.' };
    }

    const org = await this.orgRepo.findOne({ where: { id: orgId } });
    let cus = org.stripe_customer_id;
    if (!cus) {
      cus = await this.stripeService.createCustomer(user.email, user.id, 'org');
      await this.orgRepo.updateStripeCustomerid(org.id, cus);
    }
    const paymentIntent = await this.stripeService.createPaymentIntent(
      planId,
      user.id,
      PlanTargetType.USER,
      cus,
    );

    const amountInPaise = plan.price * 100;

    await this.paymentRepository.createOrgPayment(
      orgId,
      plan.id,
      paymentIntent.id,
      amountInPaise,
      plan.currency,
    );
    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  @Post('webhook')
  async webhook(@Req() request: RawBodyRequest<Request>) {
    const signature = request.headers['stripe-signature'] as string;
    let event: any;
    try {
      event = this.stripeService.verifyWebhookEvent(request.rawBody, signature);
    } catch (error) {
      throw new BadRequestException(
        `Webhook signature verification failed: ${error.message}`,
      );
    }

    switch (event.type) {
      case 'payment_intent.payment_failed': {
        await this.billingQueueService.queuePaymentUpdate(
          'failed',
          undefined, // identifierId
          event.data.object.id, // paymentIntentId (pehle galat jagah tha)
        );
        break;
      }

      case 'payment_intent.succeeded': {
        const pi = event.data.object;
        const { organizationId, userId, planId } = pi.metadata;
        const identifierId = organizationId ?? userId;

        if (!planId || !identifierId) {
          // throw mat karo, Stripe din bhar retry karega aur fix nahi hoga
          throw Error(`Bad metadata on PaymentIntent ${pi.id}`);
          break;
        }

        await this.billingQueueService.queuePaymentUpdate(
          'completed',
          identifierId,
          pi.id,
          planId,
          organizationId ? PlanTargetType.ORGANIZATION : PlanTargetType.USER,
        );
        await this.billingQueueService.queueInvoiceCreation(pi.id);
        break;
      }

      case 'invoice.finalized':
      case 'invoice.paid':
      case 'invoice.voided':
      case 'invoice.marked_uncollectible': {
        await this.billingQueueService.queueInvoiceSync(
          event.data.object.id,
          event.id,
        );
        break;
      }
    }
    return { received: true };
  }

  @Get('success')
  async paymentSuccess() {
    return { message: 'Payment successful, you can close this tab.' };
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles([UserRole.ADMIN])
  @Get('payment-history')
  async getAllPayments(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('payment-status') status?: PaymentStatus,
    @Query('plan') plan?: UserPlanEnum,
  ) {
    const [payments, total] = await this.paymentRepository.findAllPaginated(
      Number(page),
      Number(limit),
      status,
      plan,
    );

    return {
      data: payments,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }
}
