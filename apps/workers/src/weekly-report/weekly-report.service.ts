import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MailService } from '@myapp/api';
import { SignUpCountService } from '@myapp/api';
import { UsersService } from '@myapp/api';

@Injectable()
export class WeeklyReportService {
  constructor(
    private signUpCountService: SignUpCountService,
    private mailService: MailService,
    private userService : UsersService,
  ) {}

  @Cron('59 09 * * 3') // 0 9 * * 1 -- 9 am mon in every month
  async sendWeeklySignOutReport(){
    // const count = await this.signUpCountService.getSignUpCount();

    // await this.mailService.sendWeeklyReportMail(
    //     'admin@admin.com',
    //     count
    // )

    // await this.signUpCountService.resetSignUpCount();

    const oneWeek = new Date();
    oneWeek.setDate(oneWeek.getDate() - 7)

    const count = await this.userService.countSignupUser(oneWeek)
    const users = await this.userService. getSignupUsersSince(oneWeek)
    
    await this.mailService.sendWeeklyReportMail(
        'admin@admin.com',
        count,
        users
    )

    await this.signUpCountService.resetSignUpCount();
  }
}
