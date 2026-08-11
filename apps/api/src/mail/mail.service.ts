import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Queue } from 'bullmq';
@Injectable()
export class MailService {
  private transporter!: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(@InjectQueue('mailQueue') private readonly mailQueue: Queue) {
    this.initTransporter();
  }

  private async initTransporter() {
    const testAccount = await nodemailer.createTestAccount();
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    this.logger.log(
      `Ethereal Mailer initialized with user: ${testAccount.user}`,
    );
  }

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
      {toEmail},
      {
        priority: 5,
        delay: 30 * 1000,
        attempts: 2
      }
    )
  }

  async welcomeMail(toEmail: string) {
    await this.mailQueue.add(
      'send-welcome',
      { toEmail},
      {
        priority: 3,
        attempts: 3,
        backoff: {type: 'exponential', delay: 3000},
        removeOnComplete: false,
        removeOnFail: false
      }
    )
  }

  async sendResetPassOtpEmail(toEmail: string, otp: string): Promise<void> {
    await this.mailQueue.add(
      'send-reset-pass-otp',
      {toEmail, otp},
      {
        priority: 1,
        attempts: 3,
        backoff: {type: 'exponential', delay: 3000},
        removeOnComplete: false,
        removeOnFail: false
      }
    )
  }

  async sendWeeklyReportMail(
    toEmail: string,
    count: number,
    users: { email: string; createdAt: Date }[],
  ) {

    await this.mailQueue.add(
      'send-weekly-report',
      {toEmail, count, users },
      {
        priority: 5,
        attempts: 3,
        backoff: {type: 'exponential', delay: 3000},
        removeOnComplete: false,
        removeOnFail: false
      }
    )
    
  }
}
