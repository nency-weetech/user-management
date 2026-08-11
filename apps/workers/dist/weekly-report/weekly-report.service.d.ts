import { MailService } from '@myapp/api';
import { SignUpCountService } from '@myapp/api';
import { UsersService } from '@myapp/api';
export declare class WeeklyReportService {
    private signUpCountService;
    private mailService;
    private userService;
    constructor(signUpCountService: SignUpCountService, mailService: MailService, userService: UsersService);
    sendWeeklySignOutReport(): Promise<void>;
}
