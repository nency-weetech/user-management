import { BaseInterfaceRepository } from "../common/base.interface";
import { Payments } from "../entities/payment.entity";
export interface PaymentsInterface extends BaseInterfaceRepository<Payments> {
    createPayment(userId: string, sessionId: string, amount: number, currency: string): Promise<Payments>;
    findBySessionId(sessionId: string): Promise<Payments | null>;
    markSucceeded(sessionId: string, paymentIntentId: string): Promise<void>;
}
