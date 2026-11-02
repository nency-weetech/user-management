import http from 'k6/http';
import { check } from 'k6';
import { Counter, Trend } from 'k6/metrics';
import exec from 'k6/execution';

const BASE = __ENV.BASE_URL || 'http://localhost:8088';
const RUN_ID = __ENV.RUN_ID || 'run';
const RATE = Number(__ENV.RATE || 50);
const DURATION = __ENV.DURATION || '180s';

const byServer = new Counter('reqs_by_server');
const durByServer = new Trend('dur_by_server', true);

export const options = {
  scenarios: {
    steady: {
      executor: 'constant-arrival-rate',
      rate: RATE,
      timeUnit: '1s',
      duration: DURATION,
      preAllocatedVUs: 50,
      maxVUs: 200,
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    'reqs_by_server{server:blue}': ['count>=0'],
    'reqs_by_server{server:green}': ['count>=0'],
    'reqs_by_server{server:none}': ['count>=0'],
    'dur_by_server{server:blue}': ['max>=0'],
    'dur_by_server{server:green}': ['max>=0'],
  },
};

export default function () {
  const rid = `${RUN_ID}-${exec.scenario.iterationInTest}`;
  const res = http.get(`${BASE}/bg-test/ping`, {
    headers: { 'X-Request-Id': rid },
    timeout: '10s',
  });
  const server = res.headers['X-Served-By'] || 'none';
  byServer.add(1, { server });
  durByServer.add(res.timings.duration, { server });
  check(res, { 'status 200': (r) => r.status === 200 });
}