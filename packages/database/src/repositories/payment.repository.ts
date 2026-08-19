import { InjectRepository } from "@nestjs/typeorm";
import { BaseAbstractRepostitory } from "../common/base.repository";
import { Payments } from "../entities/payment.entity";
import { Repository } from "typeorm";
import { PaymentStatus } from "../enums/payment-status.enum";
import { PaymentsInterface } from "../interfaces/payments.interface";

export class PaymentRepository extends BaseAbstractRepostitory<Payments> implements PaymentsInterface{
    constructor(@InjectRepository(Payments) private readonly paymentsRepo : Repository<Payments>){
        super(paymentsRepo)
    }

    createPayment(userId: string, sessionId: string, amount: number, currency: string): Promise<Payments>{
        const userPayment = this.paymentsRepo.create({
            userId,
            stripeCheckoutSessionId: sessionId,
            amount,
            currency,
            status : PaymentStatus.PENDING
        });
        return this.paymentsRepo.save(userPayment)
    }

    findBySessionId(sessionId : string) :Promise<Payments | null>{
        return this.paymentsRepo.findOneBy({stripeCheckoutSessionId: sessionId})
    }

    async markSucceeded(sessionId: string, paymentIntentId: string): Promise<void>{
        await this.paymentsRepo.update(
            {stripeCheckoutSessionId: sessionId},
            {
                stripePaymentIntentId: paymentIntentId,
                status: PaymentStatus.SUCCEEDED
            }
        )
    }

    async markExpired(sessionId: string): Promise<void>{
        await this.paymentsRepo.update(
            {stripeCheckoutSessionId : sessionId},
            {
                status: PaymentStatus.EXPIRED
            }
        )
    }
}