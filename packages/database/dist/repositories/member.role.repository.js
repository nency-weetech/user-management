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
exports.MemberRoleRepository = void 0;
const typeorm_1 = require("@nestjs/typeorm");
const base_repository_1 = require("../common/base.repository");
const member_role_entity_1 = require("../entities/member.role.entity");
const typeorm_2 = require("typeorm");
let MemberRoleRepository = class MemberRoleRepository extends base_repository_1.BaseAbstractRepostitory {
    memberRoleRepo;
    constructor(memberRoleRepo) {
        super(memberRoleRepo);
        this.memberRoleRepo = memberRoleRepo;
    }
    async assignRole(organizationMemberId, roleId) {
        const memberRole = this.memberRoleRepo.create({
            organization_member: { id: organizationMemberId },
            roles: { id: roleId },
        });
        const saved = await this.memberRoleRepo.save(memberRole);
        return this.memberRoleRepo.findOne({
            where: { id: saved.id },
            relations: { roles: true },
        });
    }
    async findByMemberId(organizationMemberId) {
        return this.memberRoleRepo.find({
            where: { organization_member_id: organizationMemberId },
        });
    }
    async isRoleAssigned(organizationMemberId, roleId) {
        const count = await this.memberRoleRepo.count({
            where: { organization_member_id: organizationMemberId, role_id: roleId },
        });
        return count > 0;
    }
};
exports.MemberRoleRepository = MemberRoleRepository;
exports.MemberRoleRepository = MemberRoleRepository = __decorate([
    __param(0, (0, typeorm_1.InjectRepository)(member_role_entity_1.MemberRoles)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MemberRoleRepository);
