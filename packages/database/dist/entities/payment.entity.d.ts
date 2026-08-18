import { User } from './user.entity';
import { PaymentStatus } from '../enums/payment-status.enum';
export declare class Payments {
    id: string;
    userId: string | null;
    user: User | null;
    stripeCheckoutSessionId: string;
    stripePaymentIntentId: string;
    amount: Number;
    currency: string;
    status: PaymentStatus;
    createdAt: Date;
    updatedAt: Date;
}
