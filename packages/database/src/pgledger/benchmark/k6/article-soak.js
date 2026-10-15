import http from 'k6/http';
import { check } from 'k6';
import { Counter } from 'k6/metrics';
import exec from 'k6/execution';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3100';
const LOGIN_PATH = __ENV.LOGIN_PATH || '/auth/login';
const NEWS_PATH = __ENV.ARTICLES_PATH || '/news';
const PREFIX = __ENV.PREFIX || 'maxuser';
const COUNT = Number(__ENV.COUNT || 5);
const PASSWORD = __ENV.PASSWORD || 'Test@1234';
const COOKIE_NAME = __ENV.COOKIE_NAME || '';
const RATE = Number(__ENV.RATE || 10);
const DURATION_MIN = Number(__ENV.DURATION_MIN || 30);
const WINDOW_MIN = Number(__ENV.WINDOW_MIN || 5);
const MAX_DRIFT = 1.2;
const N = Math.ceil(DURATION_MIN / WINDOW_MIN);

// Abhi sirf bina-category combos (categories ke naam pata nahi)
const COMBOS = [1, 2, 3, 4, 5].map((p) => ({ page: p, cat: '' }));

const relogins = new Counter('relogins');

const thresholds = {};
for (let i = 0; i < N; i++) {
  thresholds[`http_req_duration{window:w${i}}`] = ['max>=0'];
  thresholds[`http_req_failed{window:w${i}}`] = ['rate>=0'];
  thresholds[`http_reqs{window:w${i}}`] = ['count>=0'];
}

export const options = {
  scenarios: {
    soak: {
      executor: 'constant-arrival-rate',
      rate: RATE,
      timeUnit: '1s',
      duration: `${DURATION_MIN}m`,
      preAllocatedVUs: 20,
      maxVUs: 100,
    },
  },
  thresholds,
};

const sessions = {}; // har VU ka apna (idx -> cookie)

function login(idx) {
  const email = `${PREFIX}_${idx + 1}@example.com`;
  const r = http.post(
    `${BASE_URL}${LOGIN_PATH}`,
    JSON.stringify({ email, password: PASSWORD }),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { kind: 'login' },
    },
  );
  if (r.status !== 200 && r.status !== 201) return null;
  const pairs = Object.entries(r.cookies)
    .filter(([n]) => !COOKIE_NAME || n === COOKIE_NAME)
    .map(([n, a]) => `${n}=${a[0].value}`);
  return pairs.length ? pairs.join('; ') : null;
}

function getNews(url, cookie, w) {
  return http.get(url, {
    headers: { Cookie: cookie || '' },
    timeout: '10s',
    tags: { kind: 'news', window: `w${w}` },
  });
}

let logged = 0;

export default function () {
  const i = exec.scenario.iterationInTest;
  const idx = i % COUNT;
  const w = Math.min(
    Math.floor(exec.instance.currentTestRunDuration / 60000 / WINDOW_MIN),
    N - 1,
  );
  const c = COMBOS[i % COMBOS.length];
  const url = `${BASE_URL}${NEWS_PATH}?page=${c.page}&limit=10${c.cat ? `&category=${c.cat}` : ''}`;

  if (!sessions[idx]) {
    sessions[idx] = login(idx);
    relogins.add(1);
  }
  let res = getNews(url, sessions[idx], w);

  if (res.status === 401) {
    // token expire hua to dobara login
    sessions[idx] = login(idx);
    relogins.add(1);
    res = getNews(url, sessions[idx], w);
  }

  let hasData = false;
  try {
    hasData = res.json('data').length > 0;
  } catch (e) {}
  check(res, {
    'status 200': (r) => r.status === 200,
    'has articles': () => hasData,
  });

  if ((res.status !== 200 || !hasData) && logged++ < 5) {
    console.error(
      `BAD status=${res.status} body=${String(res.body).slice(0, 120)}`,
    );
  }
}

const ms = (v) =>
  v === undefined
    ? '-'
    : v >= 1000
      ? `${(v / 1000).toFixed(2)}s`
      : `${v.toFixed(0)}ms`;
const val = (d, n, k) => d.metrics[n] && d.metrics[n].values[k];

export function handleSummary(data) {
  const rows = [];
  for (let i = 0; i < N; i++) {
    const dur = `http_req_duration{window:w${i}}`;
    const reqs = val(data, `http_reqs{window:w${i}}`, 'count') || 0;
    rows.push({
      label: `${i * WINDOW_MIN}-${(i + 1) * WINDOW_MIN} min`,
      reqs,
      rps: reqs / (WINDOW_MIN * 60),
      avg: val(data, dur, 'avg'),
      p95: val(data, dur, 'p(95)'),
      max: val(data, dur, 'max'),
      fail: (val(data, `http_req_failed{window:w${i}}`, 'rate') || 0) * 100,
    });
  }
  const pad = (s, n) => String(s).padEnd(n);
  let out = `\n===== SOAK SUMMARY (${RATE} req/s, ${DURATION_MIN} min) =====\n`;
  out += `${pad('Window', 14)}${pad('reqs', 8)}${pad('req/s', 8)}${pad('avg', 9)}${pad('p95', 9)}${pad('max', 9)}fail%\n`;
  for (const r of rows) {
    out += `${pad(r.label, 14)}${pad(r.reqs, 8)}${pad(r.rps.toFixed(1), 8)}${pad(ms(r.avg), 9)}${pad(ms(r.p95), 9)}${pad(ms(r.max), 9)}${r.fail.toFixed(2)}\n`;
  }
  const base = rows[Math.min(1, N - 1)],
    last = rows[N - 1];
  const drift = base.p95 && last.p95 ? last.p95 / base.p95 : NaN;
  out += `\nBaseline p95 (${base.label}): ${ms(base.p95)}  Last p95: ${ms(last.p95)}  Drift: x${isNaN(drift) ? '-' : drift.toFixed(2)}\n`;
  out += `relogins: ${val(data, 'relogins', 'count') || 0}   checks pass: ${((val(data, 'checks', 'rate') || 0) * 100).toFixed(2)}%\n`;
  out += `[${drift <= MAX_DRIFT ? 'PASS' : 'FAIL'}] p95 drift limit ${MAX_DRIFT}x\n`;
  out += `[MANUAL] soak-monitor.csv: rss, pg_conns, pg_mb, redis_mb, log_mb ka slope dekho\n`;
  return { stdout: out, 'soak-summary.json': JSON.stringify(data, null, 2) };
}
