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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const bcrypt = __importStar(require("bcrypt"));
const login_response_dto_1 = require("./dto/login-response.dto");
const class_transformer_1 = require("class-transformer");
const crypto_1 = __importDefault(require("crypto"));
const mail_service_1 = require("../mail/mail.service");
const rate_limit_service_1 = require("../rate-limit/rate-limit.service");
const activity_log_service_1 = require("../activity-log/activity-log.service");
const sign_up_count_service_1 = require("../sign-up-count/sign-up-count.service");
const soft_delete_service_1 = require("../soft-delete/soft-delete.service");
let AuthService = class AuthService {
    userService;
    jwtService;
    mailService;
    rateLimitService;
    activityLogService;
    signUpCountService;
    softDeleteService;
    constructor(userService, jwtService, mailService, rateLimitService, activityLogService, signUpCountService, softDeleteService) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.mailService = mailService;
        this.rateLimitService = rateLimitService;
        this.activityLogService = activityLogService;
        this.signUpCountService = signUpCountService;
        this.softDeleteService = softDeleteService;
    }
    async register(createUserDto) {
        const existEmail = await this.userService.findEmailWithPassword(createUserDto.email);
        if (existEmail) {
            throw new common_1.ConflictException('User with this email already exist');
        }
        const saltRound = 10;
        const password = await bcrypt.hash(createUserDto.password, saltRound);
        const otp = crypto_1.default.randomInt(100000, 999999).toString();
        const hashedOtp = await bcrypt.hash(otp, 10);
        const otpExpires = new Date(Date.now() + 15 * 60 * 1000);
        const newUser = await this.userService.create({
            ...createUserDto,
            password,
            isEmailVerified: false,
            emailVerificationOtp: hashedOtp,
            emailVerificationExpires: otpExpires,
        });
        await this.mailService.sendVerificationOtpEmail(newUser.email, otp);
        await this.signUpCountService.incrSignUpCount();
        return { message: 'Register successfull! Verify email to check you email' };
    }
    async verifyEmail(dto) {
        const user = await this.userService.findByEmail(dto.email);
        if (!user)
            throw new common_1.NotFoundException('User Not found');
        if (user.isEmailVerified) {
            throw new common_1.BadRequestException('Email is already verified');
        }
        if (!user.emailVerificationOtp || !user.emailVerificationExpires) {
            throw new common_1.BadRequestException('No OTP found');
        }
        if (user.emailVerificationExpires < new Date()) {
            throw new common_1.BadRequestException('OTP expired');
        }
        const isValidOtp = await bcrypt.compare(dto.otp, user.emailVerificationOtp);
        if (!isValidOtp) {
            throw new common_1.BadRequestException('Invalid OTP');
        }
        await this.userService.markEmailAsValid(user.id);
        await this.mailService.welcomeMail(user.email);
        return { message: 'Email verify successfully! now you can login' };
    }
    async login(dto) {
        if (!dto || !dto.email) {
            throw new common_1.UnauthorizedException('Email and password are required');
        }
        //await this.rateLimitService.checkLoginAttempt(dto.email);
        const user = await this.userService.findEmailWithPassword(dto.email);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credantial');
        }
        if (!user.isEmailVerified) {
            throw new common_1.UnauthorizedException('Please verify your email address before logging in.');
        }
        const isPendingDeletion = await this.softDeleteService.isPendingDeletion(user.id);
        if (!user.isActive && !isPendingDeletion) {
            throw new common_1.UnauthorizedException('Your account has been deactivated/banned. Contact admin.');
        }
        const isPassworValid = await bcrypt.compare(dto.password, user.password);
        if (!isPassworValid) {
            throw new common_1.UnauthorizedException('Invalid credantial');
        }
        if (isPendingDeletion) {
            await this.softDeleteService.cancelDeletion(user.id);
            await this.activityLogService.logActivity(user.id, 'ACCOUNT_DELETE_REQUEST_CANCEL');
        }
        await this.userService.updateLastLogin(user.id);
        //await this.rateLimitService.resetAttempts(dto.email);
        await this.activityLogService.logActivity(user.id, 'LOGIN');
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
        };
        const tokens = await this.genrateToken(payload.id, payload.email, payload.role);
        await this.updateRefreshTokenHash(payload.id, tokens.refreshToken);
        return (0, class_transformer_1.plainToInstance)(login_response_dto_1.LoginResponseDto, {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            tokenType: 'Bearer',
            user,
        }, { excludeExtraneousValues: true });
    }
    async genrateToken(userId, email, role) {
        const payload = { id: userId, email, role };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: process.env.ACCESS_JWT_SECRET,
                expiresIn: '15m',
            }),
            this.jwtService.signAsync(payload, {
                secret: process.env.REFRESH_JWT_SECRET,
                expiresIn: '7d',
            }),
        ]);
        return { accessToken, refreshToken };
    }
    async updateRefreshTokenHash(userId, refreshToken) {
        const hashRefreshToken = await bcrypt.hash(refreshToken, 10);
        await this.userService.updateRefreshToken(userId, hashRefreshToken);
    }
    async refreshTokens(userId, refreshToken) {
        const user = await this.userService.findOne(userId);
        if (!user || !user.refreshToken) {
            throw new common_1.UnauthorizedException('Access Denied');
        }
        const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
        if (!refreshTokenMatches) {
            throw new common_1.UnauthorizedException('Access Denied - Token Reuse Detected');
        }
        const tokens = await this.genrateToken(user.id, user.email, user.role);
        await this.updateRefreshTokenHash(user.id, tokens.refreshToken);
        return tokens;
    }
    async logout(userId) {
        await this.userService.updateRefreshToken(userId, null);
        await this.activityLogService.logActivity(userId, 'LOGOUT');
    }
    async forgotPassword(dto) {
        const user = await this.userService.findByEmail(dto.email);
        await this.rateLimitService.checkForgotPasswordAttempt(dto.email);
        if (!user) {
            return {
                message: 'If an account exists with that email, an OTP has been sent.',
            };
        }
        const otp = crypto_1.default.randomInt(100000, 999999).toString();
        const hashedOtp = await bcrypt.hash(otp, 10);
        const otpExpires = new Date(Date.now() + 15 * 60 * 1000);
        await this.userService.saveOtp(user.id, hashedOtp, otpExpires);
        await this.mailService.sendResetPassOtpEmail(user.email, otp);
        await this.rateLimitService.resetAttempts(dto.email);
        return {
            message: 'If an account exists with that email, an OTP has been sent.',
        };
    }
    async verifyOtp(dto) {
        const user = await this.userService.findByEmail(dto.email);
        if (!user || !user.passwordResetOtp || !user.resetOtpExpires) {
            throw new common_1.BadRequestException('Invalid or expires OTP');
        }
        if (user.resetOtpExpires < new Date()) {
            throw new common_1.BadRequestException('OTP expired');
        }
        if (user.otpAttempts >= 3) {
            await this.userService.clearOtp(user.id);
            throw new common_1.BadRequestException('Too many failed attempts. OTP invalidated.');
        }
        const isValidOtp = await bcrypt.compare(dto.otp, user.passwordResetOtp);
        if (!isValidOtp) {
            await this.userService.incrementOtpAttemp(user.id);
            const updatedAttempts = user.otpAttempts + 1;
            const remainingAttempts = 3 - updatedAttempts;
            throw new common_1.BadRequestException(`Invalid OTP. ${remainingAttempts > 0 ? remainingAttempts + ' attempts remaining.' : 'OTP invalidated.'}`);
        }
        await this.userService.clearOtp(user.id);
        const resetSessionToken = await this.jwtService.signAsync({ sub: user.id, purpose: 'password_reset' }, {
            secret: process.env.JWT_RESET_SECRET || 'reset-secret',
            expiresIn: '10m',
        });
        return {
            message: 'OTP verified successfully.',
            resetSessionToken,
        };
    }
    async resetPassword(dto) {
        let payload;
        try {
            payload = await this.jwtService.verifyAsync(dto.resetSessionToken, {
                secret: process.env.JWT_RESET_SECRET || 'reset-secret',
            });
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired reset session token');
        }
        if (payload.purpose !== 'password_reset') {
            throw new common_1.UnauthorizedException('Invalid token purpose');
        }
        const user = await this.userService.findOne(payload.sub);
        if (!user) {
            throw new common_1.BadRequestException('User no longer exists');
        }
        const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);
        await this.userService.updatePasswordAndRevokeSession(user.id, newPasswordHash);
        await this.activityLogService.logActivity(user.id, 'RESET_PASSWORD');
        return {
            message: 'Password has been reset successfully. Please log in with your new password.',
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        mail_service_1.MailService,
        rate_limit_service_1.RateLimitService,
        activity_log_service_1.ActivityLogService,
        sign_up_count_service_1.SignUpCountService,
        soft_delete_service_1.SoftDeleteService])
], AuthService);
//# sourceMappingURL=auth.service.js.map