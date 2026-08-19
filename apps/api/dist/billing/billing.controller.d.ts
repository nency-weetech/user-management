import { RawBodyRequest } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { PaymentRepository, User, UserPlanRepository } from '@myapp/database';
import { Request } from 'express';
import { BillingQueueService } from './billing.queue.service';
export declare class BillingController {
    private stripeService;
    private paymentRepository;
    private userPlanRepo;
    private billingQueueService;
    constructor(stripeService: StripeService, paymentRepository: PaymentRepository, userPlanRepo: UserPlanRepository, billingQueueService: BillingQueueService);
    checkout(user: User): Promise<{
        message: string;
        checkoutUrl?: undefined;
    } | {
        checkoutUrl: string;
        message?: undefined;
    }>;
    webhook(request: RawBodyRequest<Request>): Promise<{
        received: boolean;
    }>;
    paymentSuccess(): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=billing.controller.d.ts.map