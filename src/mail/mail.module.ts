import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { BullModule } from '@nestjs/bullmq';
import { MailProcessor } from './mail.processor';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'mailQueue',
    }),
    BullBoardModule.forFeature({
      name: 'mailQueue',
      adapter: BullMQAdapter
    }),
    UsersModule
  ],
  providers: [MailService, MailProcessor],
  exports: [MailService],
})
export class MailModule {}
