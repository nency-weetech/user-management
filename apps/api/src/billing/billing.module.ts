import { OrganizationPlan, OrganizationPlanRepository, OrganizationRepository, Organizations, PaymentRepository, Payments } from '@myapp/database';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { BillingController } from './billing.controller';
import { StripeService } from './stripe.service';
import { BillingQueueService } from './billing.queue.service';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullModule } from '@nestjs/bullmq';
import { MailModule } from '../mail/mail.module';
import { OrganizationModule } from '../organization/organization.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payments, OrganizationPlan, Organizations]),
    UsersModule,
    OrganizationModule,
    MailModule,
    BullModule.registerQueue({
        name: 'billingQueue'
    }),
    BullBoardModule.forFeature({
        name: 'billingQueue',
        adapter: BullMQAdapter
    }),
  ],
  controllers: [BillingController],
  providers: [StripeService, PaymentRepository, BillingQueueService, OrganizationPlanRepository, OrganizationRepository],
})
export class BillingModule {}
