import http from 'k6/http';
import { check } from 'k6';
import { Counter } from 'k6/metrics';
import exec from 'k6/execution';

// ---------- Config (yahan badlo) ----------
const BASE_URL = 'http://localhost:3100';
const NORMAL = 10; // req/s normal load
const SPIKE = 60; // req/s spike (capacity ~43 se upar)
const MAX_SPIKE_ERROR = 5; // % : spike me allowed errors
const RECOVERY_TOLERANCE = 1.2; // p95 baseline ke 1.2x ke andar = recovered
const RECOVERY_WITHIN = 2; // itne recovery windows (minutes) ke andar recover hona chahiye

const PHASES = [
  { key: 'before', label: 'Before   (10 rps)', secs: 60 },
  { key: 'spike', label: 'Spike    (10 -> 60 rps)', secs: 40 },
  { key: 'rec1', label: 'Recovery 1 (+0-1 min)', secs: 60 },
  { key: 'rec2', label: 'Recovery 2 (+1-2 min)', secs: 60 },
  { key: 'rec3', label: 'Recovery 3 (+2-3 min)', secs: 60 },
  { key: 'rec4', label: 'Recovery 4 (+3-4 min)', secs: 60 },
  { key: 'rec5', label: 'Recovery 5 (+4-5 min)', secs: 60 },
];

function steady(key, startTime) {
  return {
    executor: 'constant-arrival-rate',
    rate: NORMAL,
    timeUnit: '1s',
    duration: '1m',
    startTime,
    preAllocatedVUs: 30,
    maxVUs: 200,
    gracefulStop: '15s',
    tags: { phase: key },
  };
}

// Dummy thresholds sirf isliye ki per-phase numbers summary me aayein
const thresholds = {};
for (const p of PHASES) {
  thresholds[`http_req_duration{phase:${p.key}}`] = ['max>=0'];
  thresholds[`http_req_failed{phase:${p.key}}`] = ['rate>=0'];
  thresholds[`http_reqs{phase:${p.key}}`] = ['count>=0'];
}

export const options = {
  scenarios: {
    before: steady('before', '0s'),
    spike: {
      executor: 'ramping-arrival-rate',
      startRate: NORMAL,
      timeUnit: '1s',
      startTime: '60s',
      preAllocatedVUs: 200,
      maxVUs: 800,
      gracefulStop: '15s',
      stages: [
        { duration: '10s', target: SPIKE }, // achanak jump
        { duration: '30s', target: SPIKE }, // spike hold
      ],
      tags: { phase: 'spike' },
    },
    rec1: steady('rec1', '100s'),
    rec2: steady('rec2', '160s'),
    rec3: steady('rec3', '220s'),
    rec4: steady('rec4', '280s'),
    rec5: steady('rec5', '340s'),
  },
  summaryTrendStats: ['avg', 'med', 'p(95)', 'p(99)', 'max'],
  thresholds,
};

// ---------- Status breakdown ----------
const c201 = new Counter('res_201_ok');
const c429 = new Counter('res_429_rate_limited');
const c5xx = new Counter('res_5xx_server_error');
const cTimeout = new Counter('res_timeout_10s');
const cOther = new Counter('res_other_4xx');

let logged = 0; // har VU apna count rakhta hai

export default function () {
  const userNum = `${__VU}_${__ITER}`;

  const payload = JSON.stringify({
    first_name: 'Load',
    last_name: 'Test',
    email: `loaduser_${userNum}@example.com`,
    password: 'Passw0rd!123',
  });

  const res = http.post(`${BASE_URL}/auth/signUp`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (res.status === 201) c201.add(1);
  else if (res.status === 0) cTimeout.add(1);
  else if (res.status === 429) c429.add(1);
  else if (res.status >= 500) c5xx.add(1);
  else cOther.add(1);

  check(res, { 'status 201': (r) => r.status === 201 });

  if (res.status !== 201 && res.status !== 0 && logged++ < 3) {
    console.error(
      `FAIL status=${res.status} body=${String(res.body).slice(0, 200)}`,
    );
  }
}

// ---------- Summary ----------
const ms = (v) =>
  v === undefined
    ? '-'
    : v >= 1000
      ? `${(v / 1000).toFixed(2)}s`
      : `${v.toFixed(0)}ms`;
const val = (data, name, key) =>
  data.metrics[name] && data.metrics[name].values[key];
const cnt = (data, name) => val(data, name, 'count') || 0;

export function handleSummary(data) {
  const rows = PHASES.map((p) => {
    const d = `http_req_duration{phase:${p.key}}`;
    const reqs = cnt(data, `http_reqs{phase:${p.key}}`);
    const failRate =
      (val(data, `http_req_failed{phase:${p.key}}`, 'rate') || 0) * 100;
    return {
      ...p,
      reqs,
      rps: reqs / p.secs,
      avg: val(data, d, 'avg'),
      p95: val(data, d, 'p(95)'),
      p99: val(data, d, 'p(99)'),
      max: val(data, d, 'max'),
      fail: failRate,
    };
  });

  const pad = (s, n) => String(s).padEnd(n);
  let out = '\n=========== SPIKE TEST SUMMARY ===========\n\n';
  out += `${pad('Phase', 26)}${pad('reqs', 7)}${pad('req/s', 8)}${pad('avg', 9)}${pad('p95', 9)}${pad('p99', 9)}${pad('max', 9)}fail%\n`;
  out += '-'.repeat(84) + '\n';
  for (const r of rows) {
    out += `${pad(r.label, 26)}${pad(r.reqs, 7)}${pad(r.rps.toFixed(1), 8)}${pad(ms(r.avg), 9)}${pad(ms(r.p95), 9)}${pad(ms(r.p99), 9)}${pad(ms(r.max), 9)}${r.fail.toFixed(2)}\n`;
  }

  // Status breakdown
  const ok = cnt(data, 'res_201_ok');
  const e429 = cnt(data, 'res_429_rate_limited');
  const e5 = cnt(data, 'res_5xx_server_error');
  const eT = cnt(data, 'res_timeout_10s');
  const eO = cnt(data, 'res_other_4xx');
  out += `\nStatus breakdown (poora test):\n`;
  out += `  201 ok: ${ok}   429: ${e429}   5xx: ${e5}   timeout(10s): ${eT}   other 4xx: ${eO}\n`;

  // k6 ne jo load nahi bheja
  const dropped = cnt(data, 'dropped_iterations');
  out += `  dropped_iterations: ${dropped}${dropped > 0 ? '  (maxVUs kam pade, load poora nahi gaya)' : ''}\n`;

  // Recovery
  const base = rows[0].p95;
  const spikeRow = rows[1];
  const recs = rows.slice(2);
  let recoveredIdx = -1;
  recs.forEach((r, i) => {
    if (
      recoveredIdx === -1 &&
      r.p95 !== undefined &&
      base !== undefined &&
      r.p95 <= base * RECOVERY_TOLERANCE
    ) {
      recoveredIdx = i;
    }
  });

  out += `\nBaseline p95: ${ms(base)}   Spike peak p95: ${ms(spikeRow.p95)}   Spike peak max: ${ms(spikeRow.max)}\n`;
  out += `Recovery target: p95 <= ${ms(base * RECOVERY_TOLERANCE)} (baseline x ${RECOVERY_TOLERANCE})\n`;
  out +=
    recoveredIdx === -1
      ? '  Recovered: NO, 5 minute baad bhi baseline par nahi aaya\n'
      : `  Recovered: YES, ${recs[recoveredIdx].label} me (spike khatam hone ke ~${recoveredIdx + 1} min baad window)\n`;

  // Verdict
  const spikeOk = spikeRow.fail < MAX_SPIKE_ERROR;
  const recOk = recoveredIdx !== -1 && recoveredIdx < RECOVERY_WITHIN;
  out += `\nVERDICT\n`;
  out += `  [${spikeOk ? 'PASS' : 'FAIL'}] Spike errors ${spikeRow.fail.toFixed(2)}% (limit ${MAX_SPIKE_ERROR}%)\n`;
  out += `  [${recOk ? 'PASS' : 'FAIL'}] Recovery within ${RECOVERY_WITHIN} min\n`;
  out += `  [MANUAL] Mail queue: queue.log me dekho, wapas ~0 hui?\n`;
  out += '==========================================\n';

  return { stdout: out, 'spike-summary.json': JSON.stringify(data, null, 2) };
}
