import { User } from './user.entity';
import { PaymentStatus } from '../enums/payment-status.enum';
import { Organizations } from './organization.entity';
import { Plans_catalog } from './plans.entity';
export declare class Payments {
    id: string;
    user_id?: string;
    user?: User;
    organization_id?: string;
    organization?: Organizations;
    stripe_checkout_session_id: string | null;
    stripe_payment_intent_id: string;
    plan_id: string;
    plan: Plans_catalog;
    amount: number;
    currency: string;
    status: PaymentStatus;
    created_at: Date;
    updated_at: Date;
    stripe_invoice_id: string | null;
    invoice_status: string | null;
}
