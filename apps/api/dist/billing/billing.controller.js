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
exports.BillingController = void 0;
const common_1 = require("@nestjs/common");
const stripe_service_1 = require("./stripe.service");
const database_1 = require("@myapp/database");
const auth_guard_1 = require("../guards/auth/auth.guard");
const current_user_decorator_1 = require("../decorators/current-user.decorator");
const billing_queue_service_1 = require("./billing.queue.service");
let BillingController = class BillingController {
    stripeService;
    paymentRepository;
    userPlanRepo;
    billingQueueService;
    constructor(stripeService, paymentRepository, userPlanRepo, billingQueueService) {
        this.stripeService = stripeService;
        this.paymentRepository = paymentRepository;
        this.userPlanRepo = userPlanRepo;
        this.billingQueueService = billingQueueService;
    }
    async checkout(user) {
        const userPlan = await this.userPlanRepo.findByUserId(user.id);
        if (userPlan?.plan === database_1.UserPlanEnum.PAID) {
            return { message: 'You already have the upgraded version.' };
        }
        const session = await this.stripeService.createCheckoutSession(user.id);
        await this.paymentRepository.createPayment(user.id, session.id, session.amount_total, session.currency);
        return { checkoutUrl: session.url };
    }
    async webhook(request) {
        const signature = request.headers['stripe-signature'];
        let event;
        try {
            event = this.stripeService.verifyWebhookEvent(request.rawBody, signature);
        }
        catch (error) {
            throw new common_1.BadRequestException(`Webhook signature verification failed: ${error.message}`);
        }
        if (event.type === 'checkout.session.expired') {
            const session = event.data.object;
            const sessionId = session.id;
            await this.billingQueueService.queuePaymentUpdate('expired', sessionId);
            // const payment = await this.paymentRepository.findBySessionId(sessionId);
            // if (!payment) {
            //   return { received: true };
            // }
            // if (payment.status !== PaymentStatus.PENDING) {
            //   return { received: true };
            // }
            // await this.paymentRepository.markExpired(sessionId);
        }
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const sessionId = session.id;
            const userId = session.metadata.userId;
            const paymentIntentId = session.payment_intent;
            await this.billingQueueService.queuePaymentUpdate('completed', sessionId, userId, paymentIntentId);
            // const payment = await this.paymentRepository.findBySessionId(sessionId);
            // if (!payment) {
            //   return { received: true };
            // }
            // if (payment.status === PaymentStatus.SUCCEEDED) {
            //   return { received: true };
            // }
            // await this.paymentRepository.markSucceeded(sessionId, paymentIntentId);
            // await this.userPlanRepo.upgradeToPaid(userId);
        }
        return { received: true };
    }
    async paymentSuccess() {
        return { message: 'Payment successful, you can close this tab.' };
    }
};
exports.BillingController = BillingController;
__decorate([
    (0, common_1.Post)('checkout'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, current_user_decorator_1.currentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [database_1.User]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "checkout", null);
__decorate([
    (0, common_1.Post)('webhook'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "webhook", null);
__decorate([
    (0, common_1.Get)('success'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "paymentSuccess", null);
exports.BillingController = BillingController = __decorate([
    (0, common_1.Controller)('billing'),
    __metadata("design:paramtypes", [stripe_service_1.StripeService,
        database_1.PaymentRepository,
        database_1.UserPlanRepository,
        billing_queue_service_1.BillingQueueService])
], BillingController);
//# sourceMappingURL=billing.controller.js.map