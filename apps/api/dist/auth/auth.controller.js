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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const login_user_dto_1 = require("./dto/login-user.dto");
const current_user_decorator_1 = require("../decorators/current-user.decorator");
const auth_guard_1 = require("../guards/auth/auth.guard");
const users_service_1 = require("../users/users.service");
const create_user_dto_1 = require("../users/dto/create-user.dto");
const database_1 = require("@myapp/database");
const email_verify_dto_1 = require("./dto/email-verify.dto");
const forgget_pass_dto_1 = require("./dto/forgget-pass.dto");
const reset_password_dto_1 = require("./dto/reset-password.dto");
const throttler_1 = require("@nestjs/throttler");
const activity_log_service_1 = require("../activity-log/activity-log.service");
const soft_delete_service_1 = require("../soft-delete/soft-delete.service");
const jwt_1 = require("@nestjs/jwt");
const swagger_1 = require("@nestjs/swagger");
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
};
let AuthController = class AuthController {
    authService;
    jwtService;
    userService;
    activityLogservice;
    softDeleteService;
    constructor(authService, jwtService, userService, activityLogservice, softDeleteService) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.userService = userService;
        this.activityLogservice = activityLogservice;
        this.softDeleteService = softDeleteService;
    }
    create(createUserDto) {
        return this.authService.register(createUserDto);
    }
    verifyEmail(dto) {
        return this.authService.verifyEmail(dto);
    }
    async login(loginDto, res) {
        const result = await this.authService.login(loginDto);
        res.cookie('accessToken', result.accessToken, {
            ...COOKIE_OPTIONS,
            maxAge: 15 * 60 * 1000,
        });
        res.cookie('refreshToken', result.refreshToken, {
            ...COOKIE_OPTIONS,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return result;
    }
    async refreshToken(req, res, currentUser) {
        const refreshToken = req.cookies?.['refreshToken'];
        if (!refreshToken) {
            throw new common_1.UnauthorizedException('Refresh token missing from cookies');
        }
        const decoded = this.jwtService.decode(refreshToken);
        if (!decoded?.id) {
            throw new common_1.UnauthorizedException('Invalid access token');
        }
        const userId = decoded.id;
        const tokens = await this.authService.refreshTokens(userId, refreshToken);
        res.cookie('accessToken', tokens.accessToken, {
            ...COOKIE_OPTIONS,
            maxAge: 15 * 60 * 1000,
        });
        res.cookie('refreshToken', tokens.refreshToken, {
            ...COOKIE_OPTIONS,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return { message: 'Tokens refreshed successfully' };
    }
    async logout(req, res, currentUser) {
        await this.authService.logout(currentUser.id);
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        return { message: 'User Logged out' };
    }
    async getProfile(currentUser) {
        const user = await this.userService.findOne(currentUser.id);
        if (!user) {
            throw new common_1.UnauthorizedException('Please Login..');
        }
        return user;
    }
    async forgotpass(dto) {
        return this.authService.forgotPassword(dto);
    }
    async verifyOtp(dto) {
        return this.authService.verifyOtp(dto);
    }
    async resetPassword(dto) {
        return this.authService.resetPassword(dto);
    }
    async getActivity(id) {
        return this.activityLogservice.getRecentActivity(id);
    }
    async deleteAccount(user) {
        await this.softDeleteService.requestDeletion(user.id);
        return {
            message: 'Your account is scheduled for deletion in 30 days. Log in anytime before then to cancel.',
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Register a new user' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'User registered, verification OTP sent',
    }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email already exists' }),
    (0, common_1.Post)('/signUp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Verify email using OTP' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Email Verified successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Email is already verified' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid or expired OTP' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, common_1.Post)('verify-email'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [email_verify_dto_1.VerifyEmailDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Login with email or password' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Login Successfull, token set as a cookie',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid credantial' }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Please verify your email address before logging in.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Your account has been deactivated/banned. Contact admin.',
    }),
    (0, swagger_1.ApiResponse)({ status: 429, description: 'Too many login attempts' }),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 300000 } }),
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_user_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Refresh access and refresh token using cookie' }),
    (0, swagger_1.ApiCookieAuth)('refreshToken'),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token Refresh successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid or missing refresh token' }),
    (0, common_1.Get)('refresh'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __param(2, (0, current_user_decorator_1.currentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Logged out current user' }),
    (0, swagger_1.ApiCookieAuth)('accessToken'),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User logged out successfull' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unathorised' }),
    (0, common_1.Get)('logout'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __param(2, (0, current_user_decorator_1.currentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get the current logged in user\'s profile' }),
    (0, swagger_1.ApiCookieAuth)('accessToken'),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User fetched Successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorised' }),
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, current_user_decorator_1.currentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Request password rest OTP' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Generic message return (OTP is sent if account exist' }),
    (0, common_1.Post)('forgot-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgget_pass_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotpass", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Verify password rest OTP' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'OTP verified, reset session token returned' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid OTP or Too many failed attempts' }),
    (0, common_1.Post)('verify-otp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [email_verify_dto_1.VerifyEmailDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOtp", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Reset pasword using a valid session token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password rest successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid or expired session token' }),
    (0, common_1.Post)('reset-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reset_password_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get recent activity log for user' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User Id' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Activity list returned' }),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)(':id/activity'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getActivity", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Request account deletion (30-day grace period)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Account schedule for deletion' }),
    (0, swagger_1.ApiCookieAuth)('accessToken'),
    (0, common_1.Delete)('account'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, current_user_decorator_1.currentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [database_1.User]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "deleteAccount", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        jwt_1.JwtService,
        users_service_1.UsersService,
        activity_log_service_1.ActivityLogService,
        soft_delete_service_1.SoftDeleteService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map