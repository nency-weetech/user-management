import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Header,
  HttpCode,
  Logger,
  Param,
  ParseUUIDPipe,
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
import { PaymentIntentDto } from './dto/paymentIntent.dto';
import { DiscountService } from './discount.service';
import { calculateAmount, MIN_CHARGE_PAISE, toPaisa } from './pricing.util';
import { CustomInvoicePdfDto } from './dto/custom-invoice-pdf.dto';
import { CustomInvoicePdfService } from './custom-invoice-pdf.service';

@Controller('billing')
export class BillingController {
  private readonly logger = new Logger(BillingController.name);
  constructor(
    private stripeService: StripeService,
    private paymentRepository: PaymentRepository,
    private userPlanRepo: UserPlanRepository,
    private billingQueueService: BillingQueueService,
    private discountservice: DiscountService,
    private organizationService: OrganizationService,
    private orgRepo: OrganizationRepository,
    private orgPlanRepo: OrganizationPlanRepository,
    private mailService: MailService,
    private userRepository: UserRepository,
    @InjectRepository(Plans_catalog)
    private planCatelogRepository: Repository<Plans_catalog>,
    private customInvoicePdfservice: CustomInvoicePdfService,
  ) {}

  // @Post('checkout/:planId')
  // @UseGuards(AuthGuard)
  // async checkout(@currentUser() user: User, @Param('planId') planId: string) {
  //   const plan = await this.planCatelogRepository.findOne({
  //     where: {
  //       id: planId,
  //       target_type: PlanTargetType.USER,
  //     },
  //   });
  //   if (!plan) {
  //     throw new BadRequestException('Invalid plan');
  //   }

  //   if (plan.name === PlanType.FREE) {
  //     throw new BadRequestException('Cannot checkout for FREE plan');
  //   }

  //   const userPlan = await this.userPlanRepo.findByUserId(user.id);
  //   if (userPlan?.plan?.name === PlanType.MAX) {
  //     return { message: 'You already have the upgraded version.' };
  //   }

  //   let cus = user.stripe_customer_id;
  //   if (!cus) {
  //     cus = await this.stripeService.createCustomer(
  //       user.email,
  //       user.id,
  //       'user',
  //     );
  //     await this.userRepository.updateStripeCustomerid(user.id, cus);
  //   }
  //   const paymentIntent = await this.stripeService.createPaymentIntent(
  //     planId,
  //     user.id,
  //     PlanTargetType.USER,
  //     cus,
  //   );

  //   const amountInPaise = plan.price * 100;

  //   await this.paymentRepository.createPayment(
  //     user.id,
  //     plan.id,
  //     paymentIntent.id,
  //     amountInPaise,
  //     plan.currency,
  //   );
  //   return {
  //     clientSecret: paymentIntent.client_secret,
  //     paymentIntentId: paymentIntent.id,
  //   };
  // }

  // @Post('organizations/:orgId/checkout/:planId')
  // @UseGuards(AuthGuard)
  // async checkoutForOrganization(
  //   @currentUser() user: User,
  //   @Param('orgId') orgId: string,
  //   @Param('planId') planId: string,
  // ) {
  //   const plan = await this.planCatelogRepository.findOne({
  //     where: {
  //       id: planId,
  //       target_type: PlanTargetType.ORGANIZATION,
  //     },
  //   });
  //   if (!plan) {
  //     throw new BadRequestException('Invalid plan');
  //   }

  //   if (plan.name === PlanType.FREE) {
  //     throw new BadRequestException('Cannot checkout for FREE plan');
  //   }

  //   const isOwner = await this.orgRepo.findIsAdmin(orgId, user.id);
  //   if (!isOwner) {
  //     throw new ForbiddenException(
  //       'Only the organization owner can upgrade the plan',
  //     );
  //   }

  //   const orgPlan = await this.orgPlanRepo.findByOrgId(orgId);
  //   if (orgPlan?.plan?.name === PlanType.MAX) {
  //     return { message: 'This organization already has the upgraded version.' };
  //   }

  //   const org = await this.orgRepo.findOne({ where: { id: orgId } });
  //   let cus = org.stripe_customer_id;
  //   if (!cus) {
  //     cus = await this.stripeService.createCustomer(user.email, user.id, 'org');
  //     await this.orgRepo.updateStripeCustomerid(org.id, cus);
  //   }
  //   const paymentIntent = await this.stripeService.createPaymentIntent(
  //     planId,
  //     user.id,
  //     PlanTargetType.USER,
  //     cus,
  //   );

  //   const amountInPaise = plan.price * 100;

  //   await this.paymentRepository.createOrgPayment(
  //     orgId,
  //     plan.id,
  //     paymentIntent.id,
  //     amountInPaise,
  //     plan.currency,
  //   );
  //   return {
  //     clientSecret: paymentIntent.client_secret,
  //     paymentIntentId: paymentIntent.id,
  //   };
  // }

  private async getUserCustomerId(user: User): Promise<string> {
    const dbUser = await this.userRepository.findOne({
      where: { id: user.id },
    });
    if (dbUser?.stripe_customer_id) return dbUser.stripe_customer_id;

    const customerId = await this.stripeService.createCustomer({
      email: user.email,
      metadata: { userId: user.id },
    });
    await this.userRepository.updateStripeCustomerid(user.id, customerId);
    return customerId;
  }

  private async getOrgCustomerId(user: User, orgId: string): Promise<string> {
    const org = await this.orgRepo.findOneById(orgId);
    if (!org) throw new BadRequestException('Organization not found');
    if (org.stripe_customer_id) return org.stripe_customer_id;

    const customerId = await this.stripeService.createCustomer({
      email: user.email,
      name: org.name,
      metadata: { organizationId: orgId },
    });
    await this.orgRepo.updateStripeCustomerid(org.id, customerId);
    return customerId;
  }

  private async createPlanPayment(params: {
    user: User;
    plan: Plans_catalog;
    targetType: PlanTargetType;
    targetId: string;
    discountCode: string;
  }) {
    const { user, plan, targetType, targetId, discountCode } = params;

    const discount = await this.discountservice.resolveDiscount(
      discountCode,
      plan.currency,
    );

    const breakdown = calculateAmount(toPaisa(plan.price), discount.discount);
    if (breakdown.total < MIN_CHARGE_PAISE) {
      throw new BadRequestException('Amount is below the minimum charge');
    }

    const customerId =
      targetType === PlanTargetType.ORGANIZATION
        ? await this.getOrgCustomerId(user, targetId)
        : await this.getUserCustomerId(user);

    const invoice = await this.stripeService.createPlanInvoice({
      customerId,
      plan,
      breakdown,
      couponCode: discount.code,
      targetType,
      targetId,
      payerUserId: user.id,
    });

    try {
      const extra = {
        invoiceId: invoice.invoiceId,
        subtotal: breakdown.subtotal,
        discount: breakdown.subtotal,
        tax: breakdown.tax,
        couponCode: discount.code,
      };

      if (targetType === PlanTargetType.ORGANIZATION) {
        await this.paymentRepository.createOrgPayment(
          targetId,
          plan.id,
          invoice.paymentIntentId,
          breakdown.total,
          plan.currency,
          extra,
        );
      } else {
        await this.paymentRepository.createPayment(
          user.id,
          plan.id,
          invoice.paymentIntentId,
          breakdown.total,
          plan.currency,
          extra,
        );
      }
    } catch (error) {
      await this.stripeService.discardInvoice(invoice.invoiceId);
      throw error;
    }

    return {
      clientSecret: invoice.clientSecret,
      PaymentIntentId: invoice.paymentIntentId,
      breakdown,
    };
  }

  @Post('payment-intent/:planId')
  @UseGuards(AuthGuard)
  async createpaymentIntent(
    @currentUser() user: User,
    @Param('planId') planId: string,
    @Body() body: PaymentIntentDto,
  ) {
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
    return this.createPlanPayment({
      user,
      plan,
      targetType: PlanTargetType.USER,
      targetId: user.id,
      discountCode: body?.discountCode,
    });
  }

  @Post('organizations/:orgId/payment-intent/:planId')
  @UseGuards(AuthGuard)
  async checkoutForOrganization(
    @currentUser() user: User,
    @Param('orgId') orgId: string,
    @Param('planId') planId: string,
    @Body() body: PaymentIntentDto,
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

    return this.createPlanPayment({
      user,
      plan,
      targetType: PlanTargetType.ORGANIZATION,
      targetId: orgId,
      discountCode: body?.discountCode,
    });
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
          undefined,
          event.data.object.id,
        );
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const { organizationId, userId, planId } = paymentIntent.metadata;
        const identifierId = organizationId ?? userId;

        if (!planId || !identifierId) {
          this.logger.error(
            `Bad metadata on PaymentIntent ${paymentIntent.id}`,
          );
          break;
        }

        await this.billingQueueService.queuePaymentUpdate(
          'completed',
          identifierId,
          paymentIntent.id,
          planId,
          organizationId ? PlanTargetType.ORGANIZATION : PlanTargetType.USER,
          event.created * 1000,
        );

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

  @Post('payments/:paymentId/custom-invoice-pdf')
  @HttpCode(202)
  @UseGuards(AuthGuard)
  create(
    @currentUser() user: User,
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
    @Body() dto: CustomInvoicePdfDto,
  ) {
    return this.customInvoicePdfservice.create(user, paymentId, dto);
  }

  @Get('custom-invoice-pdf/:jobId')
  @UseGuards(AuthGuard)
  status(
    @currentUser() user: User,
    @Param('jobId', ParseUUIDPipe) jobId: string,
  ) {
    return this.customInvoicePdfservice.status(user, jobId);
  }

  @Get('custom-invoice-pdf/:jobId/download')
  @UseGuards(AuthGuard)
  @Header('Cache-Control', 'no-store')
  download(@currentUser() user: User, @Param('jobId') jobId: string) {
    return this.customInvoicePdfservice.download(user, jobId);
  }
}
