import { BaseAbstractRepostitory } from '../common/base.repository';
import { Payments } from '../entities/payment.entity';
import { Repository } from 'typeorm';
import { PaymentsInterface } from '../interfaces/payments.interface';
export declare class PaymentRepository extends BaseAbstractRepostitory<Payments> implements PaymentsInterface {
    private readonly paymentsRepo;
    constructor(paymentsRepo: Repository<Payments>);
    createPayment(userId: string, sessionId: string, amount: number, currency: string): Promise<Payments>;
    findBySessionId(sessionId: string): Promise<Payments | null>;
    markSucceeded(sessionId: string, paymentIntentId: string): Promise<void>;
    markExpired(sessionId: string): Promise<void>;
    findStalePending(cutoff: Date): Promise<Payments[]>;
}
