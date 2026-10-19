import http from 'k6/http';
import { check } from 'k6';

export const options = { vus: 1, iterations: 1 };

const BASE = 'http://localhost:3100';
const JSON_H = { 'Content-Type': 'application/json' };
const log = (step, r) =>
  console.log(`${step.padEnd(16)} ${r.status}  ${r.timings.duration.toFixed(0)}ms`);
const cookie = (r, name) => (r.cookies[name] ? r.cookies[name][0].value : null);

export default function () {
  // ---- login (what you already ran) ----
  const login = http.post(
    `${BASE}/auth/kc/login`,
    JSON.stringify({ email: 'test@example.com', password: 'Test@1234' }),
    { headers: JSON_H },
  );
  log('login', login);
  check(login, { 'login 200': (r) => r.status === 200 });
  const oldAccess = cookie(login, 'kc_access_token');
  const refresh1 = cookie(login, 'kc_refresh_token');

  // ---- A: me ----
  const me = http.get(`${BASE}/auth/kc/me`);
  log('me', me);
  check(me, {
    'me 200': (r) => r.status === 200,
    'roles include user': (r) => r.json('roles').includes('user'),
  });

  // ---- B: refresh ----
  const refresh = http.post(`${BASE}/auth/kc/refresh`, null);
  log('refresh', refresh);
  check(refresh, {
    'refresh 200': (r) => r.status === 200,
    'refresh token rotated': (r) => cookie(r, 'kc_refresh_token') !== refresh1,
  });

  // ---- C: logout ----
  const logout = http.post(`${BASE}/auth/kc/logout`, null);
  log('logout', logout);
  check(logout, { 'logout 204': (r) => r.status === 204 });

  const meAfter = http.get(`${BASE}/auth/kc/me`);
  log('me after logout', meAfter);
  check(meAfter, { 'me after logout 401': (r) => r.status === 401 });

  // Not a check: we only observe this one
  const stale = http.get(`${BASE}/auth/kc/me`, {
    headers: { Authorization: `Bearer ${oldAccess}` },
  });
  log('stale token', stale);
}