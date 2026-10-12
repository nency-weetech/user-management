
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    forgot_password_load: {
      executor: 'constant-vus',
      vus: 5,
      duration: '1m',
    },
  },

  thresholds: {
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3100';
const EMAIL = __ENV.TEST_EMAIL || 'testaccount@example.com';

export default function () {
  if (!EMAIL) {
    throw new Error('Set TEST_EMAIL to a dedicated test account email');
  }

  const payload = JSON.stringify({
    email: EMAIL,
  });

  const response = http.post(
    `${BASE_URL}/auth/forgot-password`,
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
      },
      tags: {
        endpoint: 'forgot_password',
      },
    },
  );

  check(response, {
    'expected status received': (r) =>
      r.status >= 200 && r.status < 300,
    'response time below 1 second': (r) =>
      r.timings.duration < 1000,
  });

  sleep(1);
}
