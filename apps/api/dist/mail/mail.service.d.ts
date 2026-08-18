import { Queue } from 'bullmq';
export declare class MailService {
    private readonly mailQueue;
    private transporter;
    private readonly logger;
    constructor(mailQueue: Queue);
    private initTransporter;
    sendVerificationOtpEmail(toEmail: string, otp: string): Promise<void>;
    welcomeMail(toEmail: string): Promise<void>;
    sendResetPassOtpEmail(toEmail: string, otp: string): Promise<void>;
    sendWeeklyReportMail(toEmail: string, count: number, users: {
        email: string;
        createdAt: Date;
    }[]): Promise<void>;
}
//# sourceMappingURL=mail.service.d.ts.map