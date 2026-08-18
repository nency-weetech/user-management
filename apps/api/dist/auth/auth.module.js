"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const users_module_1 = require("../users/users.module");
const mail_module_1 = require("../mail/mail.module");
const rate_limit_module_1 = require("../rate-limit/rate-limit.module");
const activity_log_module_1 = require("../activity-log/activity-log.module");
const sign_up_count_service_1 = require("../sign-up-count/sign-up-count.service");
const soft_delete_service_1 = require("../soft-delete/soft-delete.service");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [users_module_1.UsersModule, mail_module_1.MailModule, rate_limit_module_1.RateLimitModule, activity_log_module_1.ActivityLogModule],
        providers: [auth_service_1.AuthService, sign_up_count_service_1.SignUpCountService, soft_delete_service_1.SoftDeleteService],
        controllers: [auth_controller_1.AuthController],
        exports: [auth_service_1.AuthService],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map