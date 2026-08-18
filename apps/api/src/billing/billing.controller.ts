import {
  BadRequestException,
  Controller,
  Get,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import {
  PaymentRepository,
  PaymentStatus,
  User,
  UserPlanEnum,
  UserPlanRepository,
} from '@myapp/database';
import { AuthGuard } from '../guards/auth/auth.guard';
import { currentUser } from '../decorators/current-user.decorator';
import { Request } from 'express';

@Controller('billing')
export class BillingController {
  constructor(
    private stripeService: StripeService,
    private paymentRepository: PaymentRepository,
    private userPlanRepo: UserPlanRepository,
  ) {}

  @Post('checkout')
  @UseGuards(AuthGuard)
  async checkout(@currentUser() user: User) {
    
    const userPlan = await this.userPlanRepo.findByUserId(user.id)
    if(userPlan?.plan === UserPlanEnum.PAID){
        return { message: 'You already have the upgraded version.' };
    }

    const session = await this.stripeService.createCheckoutSession(user.id);
    await this.paymentRepository.createPayment(
      user.id,
      session.id,
      session.amount_total,
      session.currency,
    );
    return { checkoutUrl: session.url };
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

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const sessionId = session.id;
      const userId = session.metadata.userId;
      const paymentIntentId = session.payment_intent;

      const payment = await this.paymentRepository.findBySessionId(sessionId);
      if (!payment) {
        return { received: true };
      }

      if (payment.status === PaymentStatus.SUCCEEDED) {
        return { received: true };
      }

      await this.paymentRepository.markSucceeded(sessionId, paymentIntentId);
      await this.userPlanRepo.upgradeToPaid(userId);
    }
    return {received : true}
  }
  @Get('success')
  async paymentSuccess(){
    return {message : 'Payment successful, you can close this tab.'}
  }
}
