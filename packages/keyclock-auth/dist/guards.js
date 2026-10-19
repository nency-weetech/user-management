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
exports.KeycloakRolesGuard = exports.KcRoles = exports.KC_ROLES_KEY = exports.KeycloakAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const passport_1 = require("@nestjs/passport");
let KeycloakAuthGuard = class KeycloakAuthGuard extends (0, passport_1.AuthGuard)('keycloak-jwt') {
};
exports.KeycloakAuthGuard = KeycloakAuthGuard;
exports.KeycloakAuthGuard = KeycloakAuthGuard = __decorate([
    (0, common_1.Injectable)()
], KeycloakAuthGuard);
exports.KC_ROLES_KEY = 'kc_roles';
const KcRoles = (...roles) => (0, common_1.SetMetadata)(exports.KC_ROLES_KEY, roles);
exports.KcRoles = KcRoles;
let KeycloakRolesGuard = class KeycloakRolesGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(ctx) {
        const required = this.reflector.getAllAndOverride(exports.KC_ROLES_KEY, [
            ctx.getHandler(),
            ctx.getClass(),
        ]);
        if (!required?.length)
            return true;
        const user = ctx.switchToHttp().getRequest().user;
        return required.some((r) => user?.roles?.includes(r));
    }
};
exports.KeycloakRolesGuard = KeycloakRolesGuard;
exports.KeycloakRolesGuard = KeycloakRolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], KeycloakRolesGuard);
