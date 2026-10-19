let cached: ReturnType<typeof build> | null = null;
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function build() {
  const url = process.env.KEYCLOAK_URL ?? 'http://localhost:8180';
  const realm = process.env.KEYCLOAK_REALM ?? 'app';
  const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;
  if (!clientSecret) throw new Error('KEYCLOAK_CLIENT_SECRET is not set');
  const base = `${url}/realms/${realm}`;
  return {
    url,
    realm,
    clientId: process.env.KEYCLOAK_CLIENT_ID ?? 'nest-api',
    clientSecret,
    issuer: base,
    tokenUrl: `${base}/protocol/openid-connect/token`,
    logoutUrl: `${base}/protocol/openid-connect/logout`,
    jwksUri: `${base}/protocol/openid-connect/certs`,
    adminUrl: `${url}/admin/realms/${realm}`,
  };
}

// Lazy on purpose: runs after your ConfigModule/dotenv has loaded the env.
export const kcConfig = () => (cached ??= build());

export const KC_ACCESS_COOKIE = 'kc_access_token';
export const KC_REFRESH_COOKIE = 'kc_refresh_token';

export function decodeJwtPayload(token: string): Record<string, any> {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
}