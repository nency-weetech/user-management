import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { UserEventHandler } from './user-event.handler';
import { UserEventConsumer } from './user-events.consumer';
import { WMailService } from '../mail/mail.service';

@Module({
  imports: [BullModule.registerQueue({ name: 'mailQueue' })], 
  providers: [UserEventConsumer, UserEventHandler, WMailService],
})
export class UserEventModule {}