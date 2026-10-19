import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
declare const KeycloakAuthGuard_base: import("@nestjs/passport", { with: { "resolution-mode": "import" } }).Type<import("@nestjs/passport", { with: { "resolution-mode": "import" } }).IAuthGuard>;
export declare class KeycloakAuthGuard extends KeycloakAuthGuard_base {
}
export declare const KC_ROLES_KEY = "kc_roles";
export declare const KcRoles: (...roles: string[]) => import("@nestjs/common").CustomDecorator<string>;
export declare class KeycloakRolesGuard implements CanActivate {
    private readonly reflector;
    constructor(reflector: Reflector);
    canActivate(ctx: ExecutionContext): boolean;
}
export {};
