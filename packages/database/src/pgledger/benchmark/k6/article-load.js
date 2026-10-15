// import http from 'k6/http';
// import { check } from 'k6';
// import exec from 'k6/execution';

// const BASE_URL = 'http://localhost:3100';
// const RATE = Number(__ENV.RATE || 10);
// const HOLD = __ENV.HOLD || '5m';
// const COOKIE_NAME = __ENV.COOKIE_NAME || '';

// const USERS = [
//   { email: 'maxuser_2@example.com', password: 'Test@1234' },
//   { email: 'maxuser_4@example.com', password: 'Test@1234' },
//   { email: 'prouser_22@example.com', password: 'Test@1234' },
//   { email: 'prouser_28@example.com', password: 'Test@1234' },
//   { email: 'prouser_26@example.com', password: 'Test@1234' },
//   { email: 'prouser_2@example.com', password: 'Test@1234' },
//   { email: 'freeuser_1@example.com', password: 'Test@1234' },
// ];
// const CATEGORIES = ['tech', 'sports', 'business'];

// export const options = {
//   scenarios: {
//     articles: {
//       executor: 'ramping-arrival-rate',
//       startRate: 1,
//       timeUnit: '1s',
//       preAllocatedVUs: 50,
//       maxVUs: 300,
//       stages: [
//         { duration: '1m', target: RATE },
//         { duration: HOLD, target: RATE },
//         { duration: '30s', target: 0 },
//       ],
//     },
//   },
//   thresholds: {
//     http_req_duration: ['p(95)<500'],
//     http_req_failed: ['rate<0.01'],
//     checks: ['rate>0.99'],
//   },
// };


import http from 'k6/http';
import { check } from 'k6';
import exec from 'k6/execution';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3100';
const PREFIX = __ENV.PREFIX;                     
const COUNT = Number(__ENV.COUNT || 5);
const PASSWORD = __ENV.PASSWORD || 'Test@1234';
const COOKIE_NAME = __ENV.COOKIE_NAME || '';
const RATE = Number(__ENV.RATE || 10);
const HOLD = __ENV.HOLD || '5m';

const COMBOS = [
  { page: 1, cat: '' },
  { page: 1, cat: 'tech' },
];

export const options = {
  scenarios: {
    articles: {
      executor: 'ramping-arrival-rate',
      startRate: 1, timeUnit: '1s',
      preAllocatedVUs: 50, maxVUs: 300,
      stages: [
        { duration: '1m', target: RATE },
        { duration: HOLD, target: RATE },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
  },
};

// export function setup() {
//   const cookies = USERS.map((u) => {
//     const r = http.post(`${BASE_URL}/auth/login`, JSON.stringify(u), {
//       headers: { 'Content-Type': 'application/json' },
//     });
//     if (r.status !== 200 && r.status !== 201) {
//       throw new Error(`login failed ${u.email}: ${r.status} ${r.body}`);
//     }
//     const pairs = Object.entries(r.cookies)
//       .filter(([name]) => !COOKIE_NAME || name === COOKIE_NAME)
//       .map(([name, arr]) => `${name}=${arr[0].value}`);

//     if (pairs.length === 0) {
//       throw new Error(
//         `no cookie for ${u.email}. Names: ${Object.keys(r.cookies)}`,
//       );
//     }
//     return pairs.join('; ');
//   });
//   return { cookies };
// }

export function setup() {
  if (!PREFIX) throw new Error('PREFIX env do (maxuser ya prouser)');
  const cookies = [];
  for (let n = 1; n <= COUNT; n++) {
    const email = `${PREFIX}_${n}@example.com`;
    const r = http.post(
      `${BASE_URL}/auth/login`,
      JSON.stringify({ email, password: PASSWORD }),
      { headers: { 'Content-Type': 'application/json' } },
    );
    if (r.status !== 200 && r.status !== 201) {
      throw new Error(`login failed ${email}: ${r.status} ${r.body}`);
    }
    const pairs = Object.entries(r.cookies)
      .filter(([name]) => !COOKIE_NAME || name === COOKIE_NAME)
      .map(([name, arr]) => `${name}=${arr[0].value}`);
    if (!pairs.length)
      throw new Error(`no cookie for ${email}: ${Object.keys(r.cookies)}`);
    cookies.push(pairs.join('; '));
  }
  return { cookies };
}

// export default function (data) {
//   const i = exec.scenario.iterationInTest;
//   const cookie = data.cookies[i % data.cookies.length];
//   const page = 1 + (i % 5);
//   const cat =
//     i % 4 === 3 ? '' : `&category=${CATEGORIES[i % CATEGORIES.length]}`;

//   const res = http.get(`${BASE_URL}/news?page=${page}&limit=10${cat}`, {
//     headers: { Cookie: cookie },
//     timeout: '10s',
//   });

//   let hasData = false;
//   try {
//     hasData = res.json('data').length > 0;
//   } catch (e) {}

//   check(res, {
//     'status 200': (r) => r.status === 200,
//     'has articles': () => hasData,
//   });

//   if (res.status !== 200) {
//     console.error(
//       `FAIL status=${res.status} body=${String(res.body).slice(0, 150)}`,
//     );
//   }

//   if (i < 60) {
//     console.error(`${hasData ? 'OK   ' : 'EMPTY'} ${url}`);
//   }
// }

export default function (data) {
  const i = exec.scenario.iterationInTest;
  const cookie = data.cookies[i % data.cookies.length];
  const c = COMBOS[i % COMBOS.length];
  const url = `${BASE_URL}/news?page=${c.page}&limit=5`; //{c.cat ? `&category=${c.cat}` : ''}

  const res = http.get(url, { headers: { Cookie: cookie }, timeout: '10s' });

  let hasData = false;
  try { hasData = res.json('data').length > 0; } catch (e) {}

  check(res, {
    'status 200': (r) => r.status === 200,
    'has articles': () => hasData,
  });

  if ((res.status !== 200 || !hasData) && i % 50 === 0) {
    console.error(`BAD status=${res.status} url=${url} body=${String(res.body).slice(0, 120)}`);
  }
}