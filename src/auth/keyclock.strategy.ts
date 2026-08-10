import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';
import { Request } from 'express';

const KEYCLOAK_URL = process.env.KEYCLOAK_URL;
const REALM = process.env.REALM;

//Its loke AuthGuard.. check token if its valid g to validate and set req.user and if any of this fails throw 401

const cookieExtractor = (req : Request) : string | null => {
    if(req && req.cookies){
        return req.cookies['access_token'] || null;
    }
    return null;
}
@Injectable()
export class KeyclockStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/certs`,
      }),
      issure: `${KEYCLOAK_URL}/realms/${REALM}`,
      algorithms: ['RS256'],
    } as any);
  }

  async validate(payload: any) {
    return {
      id: payload.id,
      username: payload.preferred_username,
      email: payload.email,
      roles: payload.realm_access?.roles ?? [],
    };
  }
}
