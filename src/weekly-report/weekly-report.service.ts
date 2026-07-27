import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MailService } from 'src/mail/mail.service';
import { SignUpCountService } from 'src/sign-up-count/sign-up-count.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class WeeklyReportService {
  constructor(
    private signUpCountService: SignUpCountService,
    private mailService: MailService,
    private userService : UsersService
  ) {}

  @Cron('46 12 * * 1')
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
    await this.mailService.sendWeeklyReportMail(
        'admin@admin.com',
        count
    )
  }
}
