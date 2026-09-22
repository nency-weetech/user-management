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
exports.PermissionRepository = void 0;
const typeorm_1 = require("@nestjs/typeorm");
const base_repository_1 = require("../common/base.repository");
const permission_entity_1 = require("../entities/permission.entity");
const typeorm_2 = require("typeorm");
let PermissionRepository = class PermissionRepository extends base_repository_1.BaseAbstractRepostitory {
    permissionRepo;
    constructor(permissionRepo) {
        super(permissionRepo);
        this.permissionRepo = permissionRepo;
    }
    async findAllPermission() {
        return await this.permissionRepo.find();
    }
    async findByName(name) {
        return this.permissionRepo.findOne({ where: { name: name } });
    }
    async findByIds(ids) {
        return await this.permissionRepo.find({ where: { id: (0, typeorm_2.In)(ids) } });
    }
};
exports.PermissionRepository = PermissionRepository;
exports.PermissionRepository = PermissionRepository = __decorate([
    __param(0, (0, typeorm_1.InjectRepository)(permission_entity_1.Permissions)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PermissionRepository);
