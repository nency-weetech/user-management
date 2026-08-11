import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { UsersService } from '@myapp/api';
export declare class MailProcessor extends WorkerHost {
    private userService;
    private readonly logger;
    private transporter;
    constructor(userService: UsersService);
    private initTranspoter;
    process(job: Job<any, any, string>): Promise<any>;
    handleVerifactionOtp(job: Job<{
        toEmail: string;
        otp: string;
    }>): Promise<{
        status: string;
        messageId: any;
    }>;
    handleOtpReminder(job: Job<{
        toEmail: string;
    }>): Promise<void>;
    welcomeMail(job: Job<{
        toEmail: string;
    }>): Promise<{
        status: string;
        messageId: any;
    }>;
    resetPassOtp(job: Job<{
        toEmail: string;
        otp: string;
    }>): Promise<void>;
    sendWeeklyReportMail(job: Job<{
        toEmail: string;
        count: number;
        users: {
            email: string;
            createdAt: Date;
        }[];
    }>): Promise<void>;
}
