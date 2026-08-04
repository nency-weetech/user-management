import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import * as nodemailer from 'nodemailer';

@Processor('mailQueue')
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);
  private transporter!: nodemailer.Transporter;

  constructor() {
    super();
    this.initTranspoter();
  }

  private async initTranspoter() {
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

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'send-verification-OTP':
        return this.handleVerifactionOtp(job);
      default:
        this.logger.warn(`Unkonown Job type: ${job.name}`);
    }
  }

  async handleVerifactionOtp(job: Job<{ toEmail: string; otp: string }>) {
    const { toEmail, otp } = job.data;

    const mailOption = {
      from: '"App Security" <no-reply@myapp.com>',
      to: toEmail,
      subject: 'Verify Your Email Address',
      html: `
        <h3>Welcome to our App!</h3>
        <p>Your email verification code is:</p>
        <h2 style="color: blue; letter-spacing: 2px;">${otp}</h2>
        <p>This code expires in 15 minutes.</p>
        `,
    };

    const info = await this.transporter.sendMail(mailOption);
    this.logger.log(`Verifiction email sent to ${toEmail}`);
    this.logger.log(
      `Verifiction Email URL: ${nodemailer.getTestMessageUrl(info)}`,
    );

    return { status: 'sent', messageId: info.messageId };
  }

  async welcomeMail(job: Job<{ toEmail: string }>) {
    const { toEmail } = job.data;
    const mailOption = {
      from: '"App Security" <no-reply@myapp.com>',
      to: toEmail,
      subject: 'Verify Your Email Address',
      html: `
            <h3>Welcome ${toEmail} </h3>
            `,
    };
    const info = await this.transporter.sendMail(mailOption);
    this.logger.log(`Welcom mail: ${nodemailer.getTestMessageUrl(info)}`);

    return { status: 'sent', messageId: info.messageId };
  }
}
