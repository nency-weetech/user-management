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
exports.RolePermissionRepository = void 0;
const typeorm_1 = require("@nestjs/typeorm");
const base_repository_1 = require("../common/base.repository");
const role_permission_entity_1 = require("../entities/role.permission.entity");
const typeorm_2 = require("typeorm");
let RolePermissionRepository = class RolePermissionRepository extends base_repository_1.BaseAbstractRepostitory {
    rolePermissionRepo;
    constructor(rolePermissionRepo) {
        super(rolePermissionRepo);
        this.rolePermissionRepo = rolePermissionRepo;
    }
    async linkPermission(role_id, permission_id) {
        const link = this.rolePermissionRepo.create({
            role: { id: role_id },
            permission: { id: permission_id },
        });
        return this.rolePermissionRepo.save(link);
    }
    async findByRoleId(role_id) {
        return this.rolePermissionRepo.find({
            where: { role_id: role_id },
            relations: { permission: true }
        });
    }
};
exports.RolePermissionRepository = RolePermissionRepository;
exports.RolePermissionRepository = RolePermissionRepository = __decorate([
    __param(0, (0, typeorm_1.InjectRepository)(role_permission_entity_1.RolePermissions)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RolePermissionRepository);
