import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { BullModule } from '@nestjs/bullmq';
import { MailProcessor } from './mail.processor';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'mailQueue',
    }),
    BullBoardModule.forFeature({
      name: 'mailQueue',
      adapter: BullMQAdapter
    })
  ],
  providers: [MailService, MailProcessor],
  exports: [MailService],
})
export class MailModule {}
