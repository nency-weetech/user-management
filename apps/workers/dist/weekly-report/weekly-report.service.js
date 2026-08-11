"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeeklyReportService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const api_1 = require("@myapp/api");
const api_2 = require("@myapp/api");
const api_3 = require("@myapp/api");
let WeeklyReportService = class WeeklyReportService {
    signUpCountService;
    mailService;
    userService;
    constructor(signUpCountService, mailService, userService) {
        this.signUpCountService = signUpCountService;
        this.mailService = mailService;
        this.userService = userService;
    }
    async sendWeeklySignOutReport() {
        // const count = await this.signUpCountService.getSignUpCount();
        // await this.mailService.sendWeeklyReportMail(
        //     'admin@admin.com',
        //     count
        // )
        // await this.signUpCountService.resetSignUpCount();
        const oneWeek = new Date();
        oneWeek.setDate(oneWeek.getDate() - 7);
        const count = await this.userService.countSignupUser(oneWeek);
        const users = await this.userService.getSignupUsersSince(oneWeek);
        await this.mailService.sendWeeklyReportMail('admin@admin.com', count, users);
        await this.signUpCountService.resetSignUpCount();
    }
};
exports.WeeklyReportService = WeeklyReportService;
__decorate([
    (0, schedule_1.Cron)('59 09 * * 3') // 0 9 * * 1 -- 9 am mon in every month
    ,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WeeklyReportService.prototype, "sendWeeklySignOutReport", null);
exports.WeeklyReportService = WeeklyReportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [api_2.SignUpCountService,
        api_1.MailService,
        api_3.UsersService])
], WeeklyReportService);
