import http from 'k6/http';
import exec from 'k6/execution';

const BASE = __ENV.BASE_URL || 'http://localhost:3100';
const LOW = Number(__ENV.LOW_RATE || 20);
const HIGH = Number(__ENV.HIGH_RATE || 100);
const BASELINE_MIN = 2;
const OVERLOAD_MIN = Number(__ENV.OVERLOAD_MIN || 2);
const RECOVERY_MIN = Number(__ENV.RECOVERY_MIN || 10);

// dummy thresholds (hamesha pass), sirf isliye ki per-phase aur per-minute numbers summary mein dikhein
const thresholds = {};
['baseline', 'overload', 'recovery'].forEach((p) => {
  thresholds[`http_req_duration{phase:${p}}`] = ['p(95)>=0'];
  thresholds[`http_req_failed{phase:${p}}`] = ['rate>=0'];
});
for (let m = 1; m <= RECOVERY_MIN; m++) {
  thresholds[`http_req_duration{win:rec_m${m}}`] = ['p(95)>=0'];
  thresholds[`http_req_failed{win:rec_m${m}}`] = ['rate>=0'];
}

export const options = {
  scenarios: {
    baseline: {
      executor: 'constant-arrival-rate',
      rate: LOW, timeUnit: '1s', duration: `${BASELINE_MIN}m`,
      preAllocatedVUs: 50, maxVUs: 300,
      tags: { phase: 'baseline' },
    },
    overload: {
      executor: 'constant-arrival-rate',
      rate: HIGH, timeUnit: '1s', duration: `${OVERLOAD_MIN}m`,
      startTime: `${BASELINE_MIN}m`,
      preAllocatedVUs: 800, maxVUs: 2000, gracefulStop: '30s',
      tags: { phase: 'overload' },
    },
    recovery: {
      executor: 'constant-arrival-rate',
      rate: LOW, timeUnit: '1s', duration: `${RECOVERY_MIN}m`,
      startTime: `${BASELINE_MIN + OVERLOAD_MIN}m`,
      preAllocatedVUs: 100, maxVUs: 1500, gracefulStop: '30s',
      tags: { phase: 'recovery' },
    },
  },
  thresholds,
  summaryTrendStats: ['avg', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
};

export default function () {
  const sc = exec.scenario;

  // recovery ke har minute ko alag tag do
  let win = sc.name;
  if (sc.name === 'recovery') {
    const m = Math.min(RECOVERY_MIN, Math.floor((Date.now() - sc.startTime) / 60000) + 1);
    win = `rec_m${m}`;
  }

  http.post(
    `${BASE}/auth/signUp`,
    JSON.stringify({
      first_name: 'Load',
      last_name: 'Test',
      email: `loadtest+rec_${sc.name}_${sc.iterationInTest}_${Date.now()}@example.com`,
      password: 'Passw0rd!123',
    }),
    { headers: { 'Content-Type': 'application/json' }, timeout: '10s', tags: { win } },
  );
}