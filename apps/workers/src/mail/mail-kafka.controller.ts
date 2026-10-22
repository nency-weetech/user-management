
import { Controller, Inject, Logger } from '@nestjs/common';
import {
  Ctx,
  KafkaContext,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { WMailService } from './mail.service';

@Controller()
export class MailKafkaController {
  constructor(
    private readonly mailService: WMailService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  @MessagePattern('user_onboarding')
  async handleUserRegister(
    @Payload() message: any,
    @Ctx() context: KafkaContext,
  ) {
    const ogMessage = context.getMessage();
    const headers = ogMessage.headers;

    const eventTypeHeader = headers?.['eventType']?.toString();
    if (eventTypeHeader) {
      const outboxData = typeof message.payload === 'string' 
          ? JSON.parse(message.payload) 
          : message.payload;

        const { userId, email, otp } = outboxData;
      this.logger.log(`[Kafka Consumer] User registered event caught for ${userId}. Pushing to Bull queue...`);
      await this.mailService.sendVerificationOtpEmail(email, otp);
    }
  }
}
