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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const update_user_dto_1 = require("./dto/update-user.dto");
const database_1 = require("@myapp/database");
const current_user_decorator_1 = require("../decorators/current-user.decorator");
const auth_guard_1 = require("../guards/auth/auth.guard");
const update_user_state_dto_1 = require("./dto/update-user-state.dto");
const get_user_query_dto_1 = require("./dto/get-user-query.dto");
const role_guard_1 = require("../guards/role/role.guard");
const swagger_1 = require("@nestjs/swagger");
const role_decorator_1 = require("../decorators/role.decorator");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async findAll(dto) {
        return this.usersService.findAllPaginated(dto);
    }
    findOne(id) {
        return this.usersService.findOne(id);
    }
    update(id, updateUserDto, user) {
        return this.usersService.update(id, updateUserDto, user);
    }
    async updateUserState(userId, dto) {
        const updatedUser = await this.usersService.updateUserStatus(userId, dto);
        return {
            message: `User account has been ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully.`,
            userId: updatedUser.id,
            isActice: updatedUser.isActive,
        };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get all users (paginated, admin only)' }),
    (0, swagger_1.ApiCookieAuth)('accessToken'),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'role', required: false, enum: database_1.UserRole }),
    (0, swagger_1.ApiQuery)({ name: 'isActive', required: false, type: Boolean }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated user list returned' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin role required' }),
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, role_decorator_1.Roles)([database_1.UserRole.ADMIN]),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_user_query_dto_1.GetUserQueryDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get single user by id' }),
    (0, swagger_1.ApiCookieAuth)('accessToken'),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User Not found' }),
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: "Update a user's profile (self or admin) " }),
    (0, swagger_1.ApiCookieAuth)('accessToken'),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User updated sucessfully' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: "Can not update another user's prfile unless an admin",
    }),
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.currentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Activate or deactive a user account by admin' }),
    (0, swagger_1.ApiCookieAuth)('accessToken'),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User status updated' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin role requier' }),
    (0, role_decorator_1.Roles)([database_1.UserRole.ADMIN]),
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_state_dto_1.UpdateUserStatusDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUserState", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map