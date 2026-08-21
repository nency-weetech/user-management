import { PaymentRepository } from "@myapp/database";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";

@Injectable()
export class PaymentCleanUpCorn{
    constructor(private readonly paymentRepo: PaymentRepository, @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger){}

    @Cron(CronExpression.EVERY_HOUR)
    async cleanupStelePendingPayments(){
        const cutoff = new Date(Date.now() - 60 * 60 * 100)
        const stalePayments = await this.paymentRepo.findStalePending(cutoff);
        for(const payment of stalePayments){
            await this.paymentRepo.markExpired(payment.stripePaymentIntentId);
        }
        this.logger.log(`Cleaned up ${stalePayments.length} stale pending payments`);
    }
}