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
exports.Payments = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const payment_status_enum_1 = require("../enums/payment-status.enum");
const user_plan_enum_1 = require("../enums/user-plan.enum");
const organization_entity_1 = require("./organization.entity");
let Payments = class Payments {
    id;
    user_id;
    user;
    organization_id;
    organization;
    stripe_checkout_session_id;
    stripe_payment_intent_id;
    plan;
    amount;
    currency;
    status;
    created_at;
    updated_at;
};
exports.Payments = Payments;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Payments.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Payments.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], Payments.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'uuid' }),
    __metadata("design:type", String)
], Payments.prototype, "organization_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => organization_entity_1.Organizations, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'organization_id' }),
    __metadata("design:type", organization_entity_1.Organizations)
], Payments.prototype, "organization", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Payments.prototype, "stripe_checkout_session_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Payments.prototype, "stripe_payment_intent_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: user_plan_enum_1.UserPlanEnum }),
    __metadata("design:type", String)
], Payments.prototype, "plan", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Payments.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Payments.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: payment_status_enum_1.PaymentStatus, default: payment_status_enum_1.PaymentStatus.PENDING }),
    __metadata("design:type", String)
], Payments.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], Payments.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], Payments.prototype, "updated_at", void 0);
exports.Payments = Payments = __decorate([
    (0, typeorm_1.Entity)('payments')
], Payments);
