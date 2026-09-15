import { User } from './user.entity';
import { PaymentStatus } from '../enums/payment-status.enum';
import { UserPlanEnum } from '../enums/user-plan.enum';
export declare class Payments {
    id: string;
    user_id: string | null;
    user: User | null;
    stripe_checkout_session_id: string | null;
    stripe_payment_intent_id: string;
    plan: UserPlanEnum;
    amount: Number;
    currency: string;
    status: PaymentStatus;
    created_at: Date;
    updated_at: Date;
}
