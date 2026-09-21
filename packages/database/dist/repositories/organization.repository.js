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
exports.OrganizationRepository = void 0;
const typeorm_1 = require("@nestjs/typeorm");
const base_repository_1 = require("../common/base.repository");
const organization_entity_1 = require("../entities/organization.entity");
const typeorm_2 = require("typeorm");
let OrganizationRepository = class OrganizationRepository extends base_repository_1.BaseAbstractRepostitory {
    organizationRepo;
    constructor(organizationRepo) {
        super(organizationRepo);
        this.organizationRepo = organizationRepo;
    }
    async createOrganization(userId, name, isDefault) {
        const org = this.organizationRepo.create({
            owner: { id: userId },
            name,
            is_default: isDefault,
        });
        return this.organizationRepo.save(org);
    }
    async findDefaultByUserId(userId) {
        return this.organizationRepo.findOne({ where: { owner_id: userId, is_default: true } });
    }
    async findOneById(id) {
        return this.organizationRepo.findOne({ where: { id } });
    }
    async findIsAdmin(orgId, userId) {
        return this.organizationRepo.findOne({
            where: {
                id: orgId,
                owner_id: userId
            }
        });
    }
};
exports.OrganizationRepository = OrganizationRepository;
exports.OrganizationRepository = OrganizationRepository = __decorate([
    __param(0, (0, typeorm_1.InjectRepository)(organization_entity_1.Organizations)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], OrganizationRepository);
