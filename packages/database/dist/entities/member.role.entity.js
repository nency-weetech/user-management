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
exports.MemberRoles = void 0;
const typeorm_1 = require("typeorm");
const organizationMember_entity_1 = require("./organizationMember.entity");
const role_entity_1 = require("./role.entity");
let MemberRoles = class MemberRoles {
    id;
    organization_member_id;
    organization_member;
    role_id;
    roles;
    assigned_at;
};
exports.MemberRoles = MemberRoles;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MemberRoles.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], MemberRoles.prototype, "organization_member_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => organizationMember_entity_1.OrganizationMembers, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'organization_member_id' }),
    __metadata("design:type", organizationMember_entity_1.OrganizationMembers)
], MemberRoles.prototype, "organization_member", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], MemberRoles.prototype, "role_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => role_entity_1.Roles, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'role_id' }),
    __metadata("design:type", role_entity_1.Roles)
], MemberRoles.prototype, "roles", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], MemberRoles.prototype, "assigned_at", void 0);
exports.MemberRoles = MemberRoles = __decorate([
    (0, typeorm_1.Entity)('member_roles')
], MemberRoles);
