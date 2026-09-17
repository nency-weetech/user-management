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
exports.ProfileRepository = void 0;
const typeorm_1 = require("@nestjs/typeorm");
const base_repository_1 = require("../common/base.repository");
const profile_entity_1 = require("../entities/profile.entity");
const typeorm_2 = require("typeorm");
let ProfileRepository = class ProfileRepository extends base_repository_1.BaseAbstractRepostitory {
    profileRepo;
    constructor(profileRepo) {
        super(profileRepo);
        this.profileRepo = profileRepo;
    }
    async countByUserId(userId) {
        const user = this.profileRepo.count({ where: { user_id: userId } });
        return user;
    }
    async findAllProfile(userId) {
        return await this.profileRepo.find({ where: { user_id: userId } });
    }
};
exports.ProfileRepository = ProfileRepository;
exports.ProfileRepository = ProfileRepository = __decorate([
    __param(0, (0, typeorm_1.InjectRepository)(profile_entity_1.Profile)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProfileRepository);
