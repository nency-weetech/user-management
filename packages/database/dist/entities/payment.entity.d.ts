import { User } from './user.entity';
import { PaymentStatus } from '../enums/payment-status.enum';
import { UserPlanEnum } from '../enums/user-plan.enum';
export declare class Payments {
    id: string;
    userId: string | null;
    user: User | null;
    stripeCheckoutSessionId: string | null;
    stripePaymentIntentId: string;
    plan: UserPlanEnum;
    amount: Number;
    currency: string;
    status: PaymentStatus;
    createdAt: Date;
    updatedAt: Date;
}
