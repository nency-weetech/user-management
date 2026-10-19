import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { kcConfig } from './keyclock.config';

export interface KcTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
}

export interface KcCreateUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

@Injectable()
export class KeycloakService {
  private readonly log = new Logger(KeycloakService.name);
  private adminCache: { token: string; expiresAt: number } | null = null;

  private form(params: Record<string, string>) {
    const c = kcConfig();
    return new URLSearchParams({
      client_id: c.clientId,
      client_secret: c.clientSecret,
      ...params,
    });
  }

  private async tokenRequest(params: Record<string, string>): Promise<KcTokens> {
    const res = await fetch(kcConfig().tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: this.form(params),
    });
    const body: any = await res.json().catch(() => ({}));
    if (!res.ok) {
      // Real reason goes to logs only; the client always gets a generic message.
      this.log.warn(`token request failed: ${res.status} ${body.error} - ${body.error_description}`);
      if (res.status === 400 || res.status === 401) {
        throw new UnauthorizedException('Invalid credentials');
      }
      throw new InternalServerErrorException('Identity provider error');
    }
    return body as KcTokens;
  }

  login(email: string, password: string) {
    return this.tokenRequest({ grant_type: 'password', username: email, password, scope: 'openid' });
  }

  refresh(refreshToken: string) {
    return this.tokenRequest({ grant_type: 'refresh_token', refresh_token: refreshToken });
  }

  async logout(refreshToken: string): Promise<void> {
    const res = await fetch(kcConfig().logoutUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: this.form({ refresh_token: refreshToken }),
    });
    if (!res.ok) this.log.warn(`logout returned ${res.status}`);
  }

  private async adminToken(): Promise<string> {
    if (this.adminCache && this.adminCache.expiresAt > Date.now() + 10_000) {
      return this.adminCache.token;
    }
    const res = await fetch(kcConfig().tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: this.form({ grant_type: 'client_credentials' }),
    });
    const body: any = await res.json().catch(() => ({}));
    if (!res.ok) {
      this.log.error(`admin token failed: ${res.status} ${body.error_description ?? ''}`);
      throw new InternalServerErrorException('Identity provider error');
    }
    this.adminCache = { token: body.access_token, expiresAt: Date.now() + body.expires_in * 1000 };
    return body.access_token;
  }

  async createUser(dto: KcCreateUser): Promise<string> {
    const admin = await this.adminToken();
    const base = kcConfig().adminUrl;

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

    if (res.status === 409) throw new ConflictException('User already exists');
    if (res.status === 400) {
      const b: any = await res.json().catch(() => ({}));
      throw new BadRequestException(b.errorMessage ?? 'Invalid user data');
    }
    if (!res.ok) {
      this.log.error(`create user failed: ${res.status}`);
      throw new InternalServerErrorException('Identity provider error');
    }

    const id = res.headers.get('location')?.split('/').pop();
    if (!id) throw new InternalServerErrorException('Identity provider error');

    await this.assignRealmRole(id, 'user', admin);
    return id;
  }

  private async assignRealmRole(userId: string, roleName: string, admin: string) {
    const base = kcConfig().adminUrl;
    const roleRes = await fetch(`${base}/roles/${roleName}`, {
      headers: { Authorization: `Bearer ${admin}` },
    });
    if (!roleRes.ok) throw new InternalServerErrorException('Identity provider error');
    const role: any = await roleRes.json();

    const mapRes = await fetch(`${base}/users/${userId}/role-mappings/realm`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${admin}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([{ id: role.id, name: role.name }]),
    });
    if (!mapRes.ok) throw new InternalServerErrorException('Identity provider error');
  }
}