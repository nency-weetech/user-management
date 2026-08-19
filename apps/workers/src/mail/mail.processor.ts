import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import * as nodemailer from 'nodemailer';
import {  runWithJobContext } from '@myapp/shared';
import { Inject, Logger } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Processor('mailQueue', {
  concurrency: 1,
  limiter: {
    max: 5,
    duration: 60000,
  },
})
export class MailProcessor extends WorkerHost {
  private transporter!: nodemailer.Transporter;

  constructor(@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger) {
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
  }

  async process(job: Job<any, any, string>): Promise<any> {
    return runWithJobContext(
      {
        jobName: job.name,
        queueName: 'mailQueue',
        jobId: String(job.id),
        attempt: job.attemptsMade,
      },
      async () => {
        let result;
        switch (job.name) {
          case 'send-verification-OTP':
            result = this.handleVerifactionOtp(job);
            break;
          case 'send-otp-reminder':
            result = this.handleOtpReminder(job);
            break;
          case 'send-welcome':
            result = this.welcomeMail(job);
            break;
          case 'send-reset-pass-otp':
            result = this.resetPassOtp(job);
            break;
          case 'send-weekly-report':
            result = this.sendWeeklyReportMail(job);
            break;
          case 'send-invoice':
            result = this.sendInvoice(job);
            break;
          default:
            this.logger.warn(`Unkonown Job type: ${job.name}`);
            break;
        }
        return result;
      },
    );
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
    this.logger.log(`Verifiction Email URL: ${nodemailer.getTestMessageUrl(info)}`);

    return { status: 'sent', messageId: info.messageId };
  }

  async handleOtpReminder(job: Job<{ toEmail: string }>) {
    const { toEmail } = job.data;

    this.logger.log(`⏰ Sending OTP reminder to: ${toEmail}`);
    const mailOption = {
      from: '"App Security" <no-reply@myapp.com>',
      to: toEmail,
      subject: 'Verify Email Reminder',
      html: `
            <h3>Please Verify email ${toEmail} with valid OTP</h3>
            `,
    };
    const info = await this.transporter.sendMail(mailOption);
    this.logger.log(`reminder mail: ${nodemailer.getTestMessageUrl(info)}`);
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

  async resetPassOtp(job: Job<{ toEmail: string; otp: string }>) {
    const { toEmail, otp } = job.data;
    const mailOption = {
      from: '"App Security" <no-reply@myapp.com>',
      to: toEmail,
      subject: 'Your Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>Your one-time verification code is:</p>
          <h1 style="letter-spacing: 5px; color: #4A90E2;">${otp}</h1>
          <p>This code is valid for <strong>10 minutes</strong>.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
        `,
    };

    const info = await this.transporter.sendMail(mailOption);
    this.logger.log(`Password Reset URL: ${nodemailer.getTestMessageUrl(info)}`);
  }

  async sendWeeklyReportMail(
    job: Job<{
      toEmail: string;
      count: number;
      users: { email: string; createdAt: Date }[];
    }>,
  ) {
    const { toEmail, count, users } = job.data;
    const rows = users
      .map((user) => {
        const day = new Date(user.createdAt).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        });

        return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            <a href="mailto:${user.email}" style="color: #4A90E2; text-decoration: none;">
              ${user.email}
            </a>
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; color: #555;">
            ${day}
          </td>
        </tr>
      `;
      })
      .join('');

    const mailOption = {
      from: '"App Security" <no-reply@myapp.com>',
      to: toEmail,
      subject: 'Weekly Signup Report',
      html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Weekly Signup Report</h2>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4A90E2; margin: 10px 0;">
          ${count}
        </p>
        <p style="color: #555; margin-bottom: 20px;">
          new user${count !== 1 ? 's' : ''} joined this week
        </p>

        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f5f5f5; text-align: left;">
              <th style="padding: 10px; border-bottom: 2px solid #ddd;">Email</th>
              <th style="padding: 10px; border-bottom: 2px solid #ddd;">Signed Up</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="2" style="padding: 10px;">No new signups this week.</td></tr>'}
          </tbody>
        </table>
      </div>
    `,
    };

    const info = await this.transporter.sendMail(mailOption);
    this.logger.log(`weekly signup report: ${nodemailer.getTestMessageUrl(info)}`);
  }

async sendInvoice(job: Job<{ toEmail: string; hostedInvoiceUrl: string; invoicePDF: string }>) {
  const { toEmail, hostedInvoiceUrl, invoicePDF } = job.data;

  const mailOptions = {
    from: '"App Billing" <no-reply@myapp.com>',
    to: toEmail,
    subject: 'Your payment invoice',
    html: `
      <div style="font-family: Arial, sans-serif; margin: 0 auto;">
        <h2 style="color: #333;">Thank you for your payment</h2>
        <p style="color: #555;">Your invoice is ready. You can view or download it using the links below.</p>

        <div style="margin: 24px 0;">
          <a href="${hostedInvoiceUrl}"
             style="display: inline-block; padding: 10px 20px; background-color: #4A90E2; color: #fff; text-decoration: none; border-radius: 4px; margin-right: 12px;">
            View Invoice
          </a>
          <a href="${invoicePDF}"
             style="display: inline-block; padding: 10px 20px; background-color: #f0f0f0; color: #333; text-decoration: none; border-radius: 4px;">
            Download PDF
          </a>
        </div>

        <p style="color: #999; font-size: 12px;">If the buttons don't work, copy this link into your browser: ${hostedInvoiceUrl}</p>
      </div>
    `,
  };

  const info = await this.transporter.sendMail(mailOptions);
  this.logger.log(`Invoice mail sent to ${toEmail}: ${nodemailer.getTestMessageUrl(info)}`);
}
}