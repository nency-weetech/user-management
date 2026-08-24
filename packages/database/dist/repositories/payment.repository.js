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
exports.PaymentRepository = void 0;
const typeorm_1 = require("@nestjs/typeorm");
const base_repository_1 = require("../common/base.repository");
const payment_entity_1 = require("../entities/payment.entity");
const typeorm_2 = require("typeorm");
const payment_status_enum_1 = require("../enums/payment-status.enum");
const user_repository_1 = require("./user.repository");
let PaymentRepository = class PaymentRepository extends base_repository_1.BaseAbstractRepostitory {
    paymentsRepo;
    userRepository;
    constructor(paymentsRepo, userRepository) {
        super(paymentsRepo);
        this.paymentsRepo = paymentsRepo;
        this.userRepository = userRepository;
    }
    createPayment(userId, plan, paymentIntentId, amount, currency) {
        const userPayment = this.paymentsRepo.create({
            userId,
            stripePaymentIntentId: paymentIntentId,
            plan,
            amount,
            currency,
            status: payment_status_enum_1.PaymentStatus.PENDING,
        });
        return this.paymentsRepo.save(userPayment);
    }
    findBySessionId(sessionId) {
        return this.paymentsRepo.findOneBy({ stripeCheckoutSessionId: sessionId });
    }
    findByPaymentIntentId(paymentIntentId) {
        return this.paymentsRepo.findOneBy({ stripePaymentIntentId: paymentIntentId });
    }
    async markSucceeded(paymentIntentId) {
        await this.paymentsRepo.update({ stripePaymentIntentId: paymentIntentId }, {
            status: payment_status_enum_1.PaymentStatus.SUCCEEDED,
        });
    }
    async markExpired(paymentIntentId) {
        await this.paymentsRepo.update({ stripePaymentIntentId: paymentIntentId }, {
            status: payment_status_enum_1.PaymentStatus.EXPIRED,
        });
    }
    async findStalePending(cutoff) {
        return this.paymentsRepo.find({
            where: { status: payment_status_enum_1.PaymentStatus.PENDING, createdAt: (0, typeorm_2.LessThan)(cutoff) },
        });
    }
    async findAllPaginated(page, limit, status, plan) {
        const skip = (page - 1) * limit;
        const query = this.paymentsRepo.createQueryBuilder('payment');
        if (status) {
            query.andWhere('payment.status = :status', { status });
        }
        if (plan) {
            query.andWhere('payment.plan = :plan', { plan });
        }
        query.orderBy('payment.createdAt', 'DESC').skip(skip).take(limit);
        const [payments, total] = await query.getManyAndCount();
        const userIds = payments.map((p) => p.userId);
        const users = await this.userRepository.findManyByCondition({
            where: { id: (0, typeorm_2.In)(userIds) },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
            },
        });
        const userMap = new Map(users.map((u) => [u.id, u]));
        const enrichPayment = payments.map((p) => ({
            ...p,
            user: userMap.get(p.userId) || null,
        }));
        return [enrichPayment, total];
    }
};
exports.PaymentRepository = PaymentRepository;
exports.PaymentRepository = PaymentRepository = __decorate([
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payments)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        user_repository_1.UserRepository])
], PaymentRepository);
