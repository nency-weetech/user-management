import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
@Injectable()
export class MailService {
  private transporter!: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
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
    this.logger.log(`Verifiction Email URL: ${nodemailer.getTestMessageUrl(info)}`)
  }

  async sendResetPassOtpEmail(toEmail: string, otp: string): Promise<void> {
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
    this.logger.log(`Password Reset URL: ${nodemailer.getTestMessageUrl(info)}`)
  }

  async sendWeeklyReportMail(toEmail: string, count: number){
    const mailOption = {
      from: '"App Security" <no-reply@myapp.com>',
      to: toEmail,
      subject: 'Weekly Signup Report',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Weekly Signup Report</h2>
          <p style="letter-spacing: 5px; color: #4A90E2;">${count}</p>
          <p> new users joined this week.</p>
        </div>
        `,
    };
    const info = await this.transporter.sendMail(mailOption);
    this.logger.log(`weekly signup report: ${nodemailer.getTestMessageUrl(info)}`)
  }
}
