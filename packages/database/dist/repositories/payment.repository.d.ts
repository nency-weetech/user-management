import { BaseAbstractRepostitory } from '../common/base.repository';
import { Payments } from '../entities/payment.entity';
import { Repository } from 'typeorm';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentsInterface } from '../interfaces/payments.interface';
import { UserPlanEnum } from '../enums/user-plan.enum';
import { UserRepository } from './user.repository';
export declare class PaymentRepository extends BaseAbstractRepostitory<Payments> implements PaymentsInterface {
    private readonly paymentsRepo;
    private readonly userRepository;
    constructor(paymentsRepo: Repository<Payments>, userRepository: UserRepository);
    createPayment(userId: string, plan: UserPlanEnum, paymentIntentId: string, amount: number, currency: string): Promise<Payments>;
    findBySessionId(sessionId: string): Promise<Payments | null>;
    findByPaymentIntentId(paymentIntentId: string): Promise<Payments | null>;
    markSucceeded(paymentIntentId: string): Promise<void>;
    markExpired(paymentIntentId: string): Promise<void>;
    findStalePending(cutoff: Date): Promise<Payments[]>;
    findAllPaginated(page: number, limit: number, status?: PaymentStatus, plan?: UserPlanEnum): Promise<[Payments[], number]>;
}
