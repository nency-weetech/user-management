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
  ) {}

  @Post('checkout/:plan')
  @UseGuards(AuthGuard)
  async checkout(@currentUser() user: User, @Param('plan') plan: UserPlanEnum) {
    if (!['pro', 'max'].includes(plan)) {
      throw new BadRequestException('Invalid plan');
    }

    const userPlan = await this.userPlanRepo.findByUserId(user.id);
    if (userPlan?.plan === UserPlanEnum.MAX) {
      return { message: 'You already have the upgraded version.' };
    }

    const config = PLAN_CONFIG[plan];
    if (!config) {
      throw new BadRequestException('Invalid plan');
    }

    const amountInPaise = config.price * 100;

    const paymentIntent = await this.stripeService.createPaymentIntent(
      amountInPaise,
      'inr',
      user.id,
      plan,
      'user',
    );
    await this.paymentRepository.createPayment(
      user.id,
      plan,
      paymentIntent.id,
      amountInPaise,
      'inr',
    );
    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  @Post('organizations/:orgId/checkout/:plan')
  @UseGuards(AuthGuard)
  async checkoutForOrganization(
    @currentUser() user: User,
    @Param('orgId') orgId: string,
    @Param('plan') plan: UserPlanEnum,
  ) {
    if (!['pro', 'max'].includes(plan)) {
      throw new BadRequestException('Invalid plan');
    }

    const isOwner = await this.orgRepo.findIsAdmin(orgId, user.id);
    if (!isOwner) {
      throw new ForbiddenException(
        'Only the organization owner can upgrade the plan',
      );
    }

    const orgPlan = await this.orgPlanRepo.findByOrgId(orgId);
    if (orgPlan?.plan === OrganizationPlanEnum.MAX) {
      return { message: 'This organization already has the upgraded version.' };
    }

    const config = ORGANIZATIOPN_PLAN_CONFIG[plan];
    if (!config) {
      throw new BadRequestException('Invalid plan');
    }

    const amountInPaise = config.price * 100;

    const paymentIntent = await this.stripeService.createPaymentIntent(
      amountInPaise,
      'inr',
      orgId,
      plan,
      'organization',
    );

    await this.paymentRepository.createOrgPayment(
      orgId,
      plan,
      paymentIntent.id,
      amountInPaise,
      'inr',
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

    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as any;
      const paymentIntentId = paymentIntent.id;

      await this.billingQueueService.queuePaymentUpdate(
        'failed',
        paymentIntentId,
      );
      // const payment = await this.paymentRepository.findBySessionId(sessionId);
      // if (!payment) {
      //   return { received: true };
      // }

      // if (payment.status !== PaymentStatus.PENDING) {
      //   return { received: true };
      // }

      // await this.paymentRepository.markExpired(sessionId);
    }

    if (event.type === 'payment_intent.succeeded') {
      console.log('Event type received:', event.type);
      const paymentIntent = event.data.object as any;
      const paymentIntentId = paymentIntent.id;
      const plan = paymentIntent.metadata.plan;
      
      if (paymentIntent.metadata.organizationId) {
        const orgId = paymentIntent.metadata.organizationId;
        console.log(orgId)
        await this.billingQueueService.queuePaymentUpdate(
          'completed',
          orgId,
          paymentIntentId,
          plan,
          'organization',
        );
      }else{
        const userId = paymentIntent.metadata.userId;
        await this.billingQueueService.queuePaymentUpdate(
          'completed',
          userId,
          paymentIntentId,
          plan,
          'user'
        );
      }

      //const { hostedInvoiceUrl, invoicePDF } = await this.stripeService.getInvoiceUrl(session.invoice);

      //const user = await this.userRepository.findOneById(userId);
      // await this.mailService.sendInvoice(
      //   user.email,
      //   hostedInvoiceUrl,
      //   invoicePDF,
      // );
      // const payment = await this.paymentRepository.findBySessionId(sessionId);
      // if (!payment) {
      //   return { received: true };
      // }

      // if (payment.status === PaymentStatus.SUCCEEDED) {
      //   return { received: true };
      // }

      // await this.paymentRepository.markSucceeded(sessionId, paymentIntentId);
      // await this.userPlanRepo.upgradeToPaid(userId);
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

  @Get('test')
  async testroute() {
    const intent = await this.stripeService.createPaymentIntent(
      9900,
      'inr',
      'test-user-id',
      UserPlanEnum.PRO,
    );
    console.log('clinet_seceret:', intent.client_secret);
    console.log('payment intent:', intent.id);
  }
}
