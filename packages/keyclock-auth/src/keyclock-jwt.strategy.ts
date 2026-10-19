import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import type { Request } from 'express';
import { KC_ACCESS_COOKIE, kcConfig } from './keyclock.config';

export interface KcUser {
  keycloakId: string;
  email?: string;
  roles: string[];
}

// Strategy name 'keycloak-jwt' so it never collides with your existing 'jwt' strategy.
@Injectable()
export class KeycloakJwtStrategy extends PassportStrategy(Strategy, 'keycloak-jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.[KC_ACCESS_COOKIE] ?? null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKeyProvider: passportJwtSecret({
        jwksUri: kcConfig().jwksUri,
        cache: true,
        cacheMaxAge: 10 * 60 * 1000,
        rateLimit: true,
        jwksRequestsPerMinute: 10,
      }),
      issuer: kcConfig().issuer,
      algorithms: ['RS256'],
      ignoreExpiration: false,
    });
  }

  validate(payload: any): KcUser {
    // aud is "account" by default, so check azp (the client that requested the token).
    if (payload.azp !== kcConfig().clientId) throw new UnauthorizedException();
    return {
      keycloakId: payload.sub,
      email: payload.email,
      roles: payload.realm_access?.roles ?? [],
    };
  }
}