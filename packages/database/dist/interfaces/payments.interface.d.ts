import { BaseInterfaceRepository } from "../common/base.interface";
import { Payments } from "../entities/payment.entity";
import { PaymentStatus } from "../enums/payment-status.enum";
import { UserPlanEnum } from "../enums/user-plan.enum";
export interface PaymentsInterface extends BaseInterfaceRepository<Payments> {
    createPayment(userId: string, sessionId: string, plan: UserPlanEnum, amount: number, currency: string): Promise<Payments>;
    findBySessionId(sessionId: string): Promise<Payments | null>;
    markSucceeded(sessionId: string, paymentIntentId: string): Promise<void>;
    markExpired(sessionId: string): Promise<void>;
    findStalePending(cutoff: Date): Promise<Payments[]>;
    findAllPaginated(page: number, limit: number, status?: PaymentStatus, plan?: UserPlanEnum): Promise<[Payments[], number]>;
}
