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
exports.OrganizationPlan = void 0;
const typeorm_1 = require("typeorm");
const organization_entity_1 = require("./organization.entity");
const plans_entity_1 = require("./plans.entity");
let OrganizationPlan = class OrganizationPlan {
    id;
    organization_id;
    organization;
    plan;
    plan_id;
    plan_upgraded_at;
    created_at;
    updated_at;
};
exports.OrganizationPlan = OrganizationPlan;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], OrganizationPlan.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', unique: true }),
    __metadata("design:type", String)
], OrganizationPlan.prototype, "organization_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => organization_entity_1.Organizations, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'organization_id' }),
    __metadata("design:type", organization_entity_1.Organizations)
], OrganizationPlan.prototype, "organization", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => plans_entity_1.Plans_catalog, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'plan_id' }),
    __metadata("design:type", plans_entity_1.Plans_catalog)
], OrganizationPlan.prototype, "plan", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'plan_id', type: 'uuid' }),
    __metadata("design:type", String)
], OrganizationPlan.prototype, "plan_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', nullable: true }),
    __metadata("design:type", Date)
], OrganizationPlan.prototype, "plan_upgraded_at", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], OrganizationPlan.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], OrganizationPlan.prototype, "updated_at", void 0);
exports.OrganizationPlan = OrganizationPlan = __decorate([
    (0, typeorm_1.Entity)('organization_plans')
], OrganizationPlan);
