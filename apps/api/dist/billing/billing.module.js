"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingModule = void 0;
const database_1 = require("@myapp/database");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const users_module_1 = require("../users/users.module");
const billing_controller_1 = require("./billing.controller");
const stripe_service_1 = require("./stripe.service");
const billing_queue_service_1 = require("./billing.queue.service");
const nestjs_1 = require("@bull-board/nestjs");
const bullMQAdapter_1 = require("@bull-board/api/bullMQAdapter");
const bullmq_1 = require("@nestjs/bullmq");
let BillingModule = class BillingModule {
};
exports.BillingModule = BillingModule;
exports.BillingModule = BillingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([database_1.Payments]),
            users_module_1.UsersModule,
            bullmq_1.BullModule.registerQueue({
                name: 'billingQueue'
            }),
            nestjs_1.BullBoardModule.forFeature({
                name: 'billingQueue',
                adapter: bullMQAdapter_1.BullMQAdapter
            }),
        ],
        controllers: [billing_controller_1.BillingController],
        providers: [stripe_service_1.StripeService, database_1.PaymentRepository, billing_queue_service_1.BillingQueueService],
    })
], BillingModule);
//# sourceMappingURL=billing.module.js.map