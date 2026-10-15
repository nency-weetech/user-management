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
exports.Plans_catalog = void 0;
const typeorm_1 = require("typeorm");
const plan_target_type_enum_1 = require("../enums/plan-target-type.enum");
const plan_enum_1 = require("../enums/plan.enum");
let Plans_catalog = class Plans_catalog {
    id;
    target_type;
    name;
    price;
    currency;
    daily_view_limit;
    daily_fetch_limit;
    profile_limit;
    bookmark_limit;
    created_at;
    updated_at;
};
exports.Plans_catalog = Plans_catalog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Plans_catalog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: plan_target_type_enum_1.PlanTargetType,
    }),
    __metadata("design:type", String)
], Plans_catalog.prototype, "target_type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: plan_enum_1.PlanType,
    }),
    __metadata("design:type", String)
], Plans_catalog.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'integer',
    }),
    __metadata("design:type", Number)
], Plans_catalog.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 3,
    }),
    __metadata("design:type", String)
], Plans_catalog.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'integer',
        nullable: true,
    }),
    __metadata("design:type", Number)
], Plans_catalog.prototype, "daily_view_limit", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'integer',
        nullable: true,
    }),
    __metadata("design:type", Number)
], Plans_catalog.prototype, "daily_fetch_limit", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'integer',
        nullable: true,
    }),
    __metadata("design:type", Number)
], Plans_catalog.prototype, "profile_limit", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'integer',
        nullable: true,
    }),
    __metadata("design:type", Number)
], Plans_catalog.prototype, "bookmark_limit", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Plans_catalog.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Plans_catalog.prototype, "updated_at", void 0);
exports.Plans_catalog = Plans_catalog = __decorate([
    (0, typeorm_1.Entity)('plans_catalog')
], Plans_catalog);
