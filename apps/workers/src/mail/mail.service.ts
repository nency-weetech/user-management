import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class WMailService {
  private readonly logger = new Logger(WMailService.name);

  constructor(@InjectQueue('mailQueue') private readonly mailQueue: Queue) {}

  async sendVerificationOtpEmail(toEmail: string, otp: string): Promise<void> {
    await this.mailQueue.add(
      'send-verification-OTP',
      { toEmail, otp },
      {
        priority: 1,
        attempts: 3,
        backoff: { type: 'exponential', delay: 3000 },
        removeOnComplete: false,
        removeOnFail: false,
      },
    );
    await this.mailQueue.add(
      'send-otp-reminder',
      { toEmail },
      {
        priority: 5,
        delay: 30 * 1000,
        attempts: 2,
      },
    );
  }
}
