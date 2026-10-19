import {
  Body, Controller, Get, HttpCode, Logger, Post, Req, Res, UnauthorizedException, UseGuards,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { Request, Response } from 'express';
import {
  KeycloakService, KeycloakAuthGuard, KeycloakRolesGuard, KcRoles,
  KC_ACCESS_COOKIE, KC_REFRESH_COOKIE, decodeJwtPayload, type KcTokens,
  KcUser,
} from '@myapp/keyclock-auth';
import { KcLoginDto, KcRegisterDto } from './dto';

@Controller('auth/kc')
export class KeycloakAuthController {
  private readonly log = new Logger(KeycloakAuthController.name);

  constructor(
    private readonly kc: KeycloakService,
    private readonly dataSource: DataSource,
  ) {}

  private setCookies(res: Response, t: KcTokens) {
    const secure = process.env.NODE_ENV === 'production';
    const base = { httpOnly: true, secure, sameSite: 'lax' as const };
    res.cookie(KC_ACCESS_COOKIE, t.access_token, { ...base, path: '/', maxAge: t.expires_in * 1000 });
    res.cookie(KC_REFRESH_COOKIE, t.refresh_token, {
      ...base,
      path: '/auth/kc', // refresh token is only sent to these routes
      maxAge: t.refresh_expires_in * 1000,
    });
  }

  private clearCookies(res: Response) {
    res.clearCookie(KC_ACCESS_COOKIE, { path: '/' });
    res.clearCookie(KC_REFRESH_COOKIE, { path: '/auth/kc' });
  }

  // Link an existing local user to its Keycloak identity (by email, first login only).
  // ASSUMES table "users" with columns "email" and "keycloak_id": adjust to your schema.
  private async linkLocalUser(sub: string, email?: string) {
    if (!email) return;
    try {
      await this.dataSource.query(
        `UPDATE users SET keycloak_id = $1 WHERE email = $2 AND keycloak_id IS NULL`,
        [sub, email],
      );
    } catch (e) {
      this.log.warn(`link failed: ${(e as Error).message}`);
    }
  }

  @Post('register')
  async register(@Body() dto: KcRegisterDto) {
    const id = await this.kc.createUser({
      email: dto.email,
      password: dto.password, 
      firstName: dto.first_name,
      lastName: dto.last_name,
    });
    return { id, email: dto.email };
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: KcLoginDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.kc.login(dto.email, dto.password);
    this.setCookies(res, tokens);
    const claims = decodeJwtPayload(tokens.access_token);
    await this.linkLocalUser(claims.sub, claims.email);
    return { email: claims.email, roles: claims.realm_access?.roles ?? [] };
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const rt = req.cookies?.[KC_REFRESH_COOKIE];
    if (!rt) throw new UnauthorizedException();
    try {
      const tokens = await this.kc.refresh(rt);
      this.setCookies(res, tokens); // rotated refresh token must replace the old one
      return { ok: true };
    } catch (e) {
      this.clearCookies(res);
      throw e;
    }
  }

  @Post('logout')
  @HttpCode(204)    
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const rt = req.cookies?.[KC_REFRESH_COOKIE];
    if (rt) await this.kc.logout(rt);
    this.clearCookies(res);
  }
 
  @Get('me')
  @UseGuards(KeycloakAuthGuard)
  me(@Req() req: Request & { user: KcUser }) {
    return req.user;
  }

  @Get('admin-only')
  @UseGuards(KeycloakAuthGuard, KeycloakRolesGuard)
  @KcRoles('admin')
  adminOnly() {
    return { secret: 'admins only' };
  }
}