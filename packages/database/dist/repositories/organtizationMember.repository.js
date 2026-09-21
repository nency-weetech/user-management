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
exports.OrganizationMembersRepository = void 0;
const typeorm_1 = require("@nestjs/typeorm");
const base_repository_1 = require("../common/base.repository");
const organizationMember_entity_1 = require("../entities/organizationMember.entity");
const typeorm_2 = require("typeorm");
let OrganizationMembersRepository = class OrganizationMembersRepository extends base_repository_1.BaseAbstractRepostitory {
    orgMemRepo;
    constructor(orgMemRepo) {
        super(orgMemRepo);
        this.orgMemRepo = orgMemRepo;
    }
    async createOrgMember(orgId, userId) {
        const member = this.orgMemRepo.create({
            organization: { id: orgId },
            user: { id: userId },
            joined_at: new Date()
        });
        return this.orgMemRepo.save(member);
    }
    async findByUserId(userId) {
        return this.orgMemRepo.find({ where: { user_id: userId } });
    }
};
exports.OrganizationMembersRepository = OrganizationMembersRepository;
exports.OrganizationMembersRepository = OrganizationMembersRepository = __decorate([
    __param(0, (0, typeorm_1.InjectRepository)(organizationMember_entity_1.OrganizationMembers)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], OrganizationMembersRepository);
