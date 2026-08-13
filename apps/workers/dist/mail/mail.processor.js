"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MailProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
const api_1 = require("@myapp/api");
console.log(api_1.UsersService);
let MailProcessor = MailProcessor_1 = class MailProcessor extends bullmq_1.WorkerHost {
    logger = new common_1.Logger(MailProcessor_1.name);
    transporter;
    constructor() {
        super();
        this.initTranspoter();
    }
    async initTranspoter() {
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
        this.logger.log(`Ethereal Mailer initialized with user: ${testAccount.user}`);
    }
    async process(job) {
        let result;
        switch (job.name) {
            case 'send-verification-OTP':
                result = this.handleVerifactionOtp(job);
                break;
            case 'send-otp-reminder':
                return this.handleOtpReminder(job);
            case 'send-welcome':
                result = this.welcomeMail(job);
            case 'send-reset-pass-otp':
                result = this.resetPassOtp(job);
            case 'send-weekly-report':
                result = this.sendWeeklyReportMail(job);
            default:
                this.logger.warn(`Unkonown Job type: ${job.name}`);
                break;
        }
        return result;
    }
    async handleVerifactionOtp(job) {
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
    async handleOtpReminder(job) {
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
    async welcomeMail(job) {
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
    async resetPassOtp(job) {
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
    async sendWeeklyReportMail(job) {
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
};
exports.MailProcessor = MailProcessor;
exports.MailProcessor = MailProcessor = MailProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('mailQueue', {
        concurrency: 1,
        limiter: {
            max: 5,
            duration: 60000,
        },
    }),
    __metadata("design:paramtypes", [])
], MailProcessor);
