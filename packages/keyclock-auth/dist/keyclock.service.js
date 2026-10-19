"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var KeycloakService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeycloakService = void 0;
const common_1 = require("@nestjs/common");
const keyclock_config_1 = require("./keyclock.config");
let KeycloakService = KeycloakService_1 = class KeycloakService {
    log = new common_1.Logger(KeycloakService_1.name);
    adminCache = null;
    form(params) {
        const c = (0, keyclock_config_1.kcConfig)();
        return new URLSearchParams({
            client_id: c.clientId,
            client_secret: c.clientSecret,
            ...params,
        });
    }
    async tokenRequest(params) {
        const res = await fetch((0, keyclock_config_1.kcConfig)().tokenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: this.form(params),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
            // Real reason goes to logs only; the client always gets a generic message.
            this.log.warn(`token request failed: ${res.status} ${body.error} - ${body.error_description}`);
            if (res.status === 400 || res.status === 401) {
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            throw new common_1.InternalServerErrorException('Identity provider error');
        }
        return body;
    }
    login(email, password) {
        return this.tokenRequest({ grant_type: 'password', username: email, password, scope: 'openid' });
    }
    refresh(refreshToken) {
        return this.tokenRequest({ grant_type: 'refresh_token', refresh_token: refreshToken });
    }
    async logout(refreshToken) {
        const res = await fetch((0, keyclock_config_1.kcConfig)().logoutUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: this.form({ refresh_token: refreshToken }),
        });
        if (!res.ok)
            this.log.warn(`logout returned ${res.status}`);
    }
    async adminToken() {
        if (this.adminCache && this.adminCache.expiresAt > Date.now() + 10_000) {
            return this.adminCache.token;
        }
        const res = await fetch((0, keyclock_config_1.kcConfig)().tokenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: this.form({ grant_type: 'client_credentials' }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
            this.log.error(`admin token failed: ${res.status} ${body.error_description ?? ''}`);
            throw new common_1.InternalServerErrorException('Identity provider error');
        }
        this.adminCache = { token: body.access_token, expiresAt: Date.now() + body.expires_in * 1000 };
        return body.access_token;
    }
    async createUser(dto) {
        const admin = await this.adminToken();
        const base = (0, keyclock_config_1.kcConfig)().adminUrl;
        const res = await fetch(`${base}/users`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${admin}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: dto.email,
                email: dto.email,
                firstName: dto.firstName,
                lastName: dto.lastName,
                enabled: true,
                emailVerified: true, // DEV SHORTCUT: no email-verification flow yet
                credentials: [{ type: 'password', value: dto.password, temporary: false }],
            }),
        });
        if (res.status === 409)
            throw new common_1.ConflictException('User already exists');
        if (res.status === 400) {
            const b = await res.json().catch(() => ({}));
            throw new common_1.BadRequestException(b.errorMessage ?? 'Invalid user data');
        }
        if (!res.ok) {
            this.log.error(`create user failed: ${res.status}`);
            throw new common_1.InternalServerErrorException('Identity provider error');
        }
        const id = res.headers.get('location')?.split('/').pop();
        if (!id)
            throw new common_1.InternalServerErrorException('Identity provider error');
        await this.assignRealmRole(id, 'user', admin);
        return id;
    }
    async assignRealmRole(userId, roleName, admin) {
        const base = (0, keyclock_config_1.kcConfig)().adminUrl;
        const roleRes = await fetch(`${base}/roles/${roleName}`, {
            headers: { Authorization: `Bearer ${admin}` },
        });
        if (!roleRes.ok)
            throw new common_1.InternalServerErrorException('Identity provider error');
        const role = await roleRes.json();
        const mapRes = await fetch(`${base}/users/${userId}/role-mappings/realm`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${admin}`, 'Content-Type': 'application/json' },
            body: JSON.stringify([{ id: role.id, name: role.name }]),
        });
        if (!mapRes.ok)
            throw new common_1.InternalServerErrorException('Identity provider error');
    }
};
exports.KeycloakService = KeycloakService;
exports.KeycloakService = KeycloakService = KeycloakService_1 = __decorate([
    (0, common_1.Injectable)()
], KeycloakService);
