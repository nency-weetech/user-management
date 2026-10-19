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
exports.KeycloakJwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const jwks_rsa_1 = require("jwks-rsa");
const keyclock_config_1 = require("./keyclock.config");
// Strategy name 'keycloak-jwt' so it never collides with your existing 'jwt' strategy.
let KeycloakJwtStrategy = class KeycloakJwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'keycloak-jwt') {
    constructor() {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromExtractors([
                (req) => req?.cookies?.[keyclock_config_1.KC_ACCESS_COOKIE] ?? null,
                passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            secretOrKeyProvider: (0, jwks_rsa_1.passportJwtSecret)({
                jwksUri: (0, keyclock_config_1.kcConfig)().jwksUri,
                cache: true,
                cacheMaxAge: 10 * 60 * 1000,
                rateLimit: true,
                jwksRequestsPerMinute: 10,
            }),
            issuer: (0, keyclock_config_1.kcConfig)().issuer,
            algorithms: ['RS256'],
            ignoreExpiration: false,
        });
    }
    validate(payload) {
        // aud is "account" by default, so check azp (the client that requested the token).
        if (payload.azp !== (0, keyclock_config_1.kcConfig)().clientId)
            throw new common_1.UnauthorizedException();
        return {
            keycloakId: payload.sub,
            email: payload.email,
            roles: payload.realm_access?.roles ?? [],
        };
    }
};
exports.KeycloakJwtStrategy = KeycloakJwtStrategy;
exports.KeycloakJwtStrategy = KeycloakJwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], KeycloakJwtStrategy);
