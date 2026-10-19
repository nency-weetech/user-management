"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeycloakAuthModule = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const keyclock_service_1 = require("./keyclock.service");
const keyclock_jwt_strategy_1 = require("./keyclock-jwt.strategy");
const guards_1 = require("./guards");
let KeycloakAuthModule = class KeycloakAuthModule {
};
exports.KeycloakAuthModule = KeycloakAuthModule;
exports.KeycloakAuthModule = KeycloakAuthModule = __decorate([
    (0, common_1.Module)({
        imports: [passport_1.PassportModule],
        providers: [keyclock_service_1.KeycloakService, keyclock_jwt_strategy_1.KeycloakJwtStrategy, guards_1.KeycloakAuthGuard, guards_1.KeycloakRolesGuard],
        exports: [keyclock_service_1.KeycloakService, guards_1.KeycloakAuthGuard, guards_1.KeycloakRolesGuard],
    })
], KeycloakAuthModule);
