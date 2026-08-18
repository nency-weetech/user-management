import { PaymentRepository, Payments } from "@myapp/database";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "../users/users.module";
import { BillingController } from "./billing.controller";
import { StripeService } from "./stripe.service";

@Module({
    imports: [TypeOrmModule.forFeature([Payments]),UsersModule,],
    controllers: [BillingController],
    providers: [StripeService, PaymentRepository]

})

export class BillingModule {}