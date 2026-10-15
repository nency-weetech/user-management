import { BaseAbstractRepostitory } from '../common/base.repository';
import { Payments } from '../entities/payment.entity';
import { Repository } from 'typeorm';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentsInterface } from '../interfaces/payments.interface';
import { UserPlanEnum } from '../enums/user-plan.enum';
import { UserRepository } from './user.repository';
export interface PaymentExtra {
    invoiceId: string;
    subtotal: number;
    discount: number;
    tax: number;
    couponCode: string | null;
}
export declare class PaymentRepository extends BaseAbstractRepostitory<Payments> implements PaymentsInterface {
    private readonly paymentsRepo;
    private readonly userRepository;
    constructor(paymentsRepo: Repository<Payments>, userRepository: UserRepository);
    private invoiceColumns;
    createPayment(userId: string, planId: string, paymentIntentId: string, amount: number, currency: string, extra?: PaymentExtra): Promise<Payments>;
    createOrgPayment(orgId: string, planId: string, paymentIntentId: string, amount: number, currency: string, extra?: PaymentExtra): Promise<Payments>;
    findBySessionId(sessionId: string): Promise<Payments | null>;
    findByPaymentIntentId(paymentIntentId: string): Promise<Payments | null>;
    markSucceeded(paymentIntentId: string): Promise<void>;
    markExpired(paymentIntentId: string): Promise<boolean>;
    findStalePending(cutoff: Date, limit?: number): Promise<Payments[]>;
    findAllPaginated(page: number, limit: number, status?: PaymentStatus, plan?: UserPlanEnum): Promise<[Payments[], number]>;
}
