// import http from 'k6/http';
// import { check, sleep } from 'k6';

// const BASE = __ENV.BASE_URL || 'http://localhost:3100';

// export const options = {
//   stages: [
//     { duration: '30s', target: 5 },
//     { duration: '1m', target: 5 },
//     { duration: '10s', target: 0 },
//   ],
//   summaryTrendStats: ['avg', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
// };

// export default function () {
//   const userNum = `${__VU}_${__ITER}`;

//   const payload = JSON.stringify({
//     first_name: 'Load',
//     last_name: 'Test',
//     email: `loaduser_${userNum}@example.com`,
//     password: 'Passw0rd!123',
//   });

//   const res = http.post(`${BASE}/auth/signUp`, payload, {
//     headers: { 'Content-Type': 'application/json' },
//   });

//   check(res, { 'status 201': (r) => r.status === 201 });
//   if (res.status !== 201) {
//     console.log(`FAIL status=${res.status} body=${res.body}`);
//   }
//   sleep(0.1);
// }

// export default function () {
//   const id = `${__VU}-${__ITER}-${Date.now()}`;
//   const payload = JSON.stringify({
//     first_name: 'Load',
//     last_name: 'Test',
//     email: `loadtest+${id}@example.com`,
//     password: 'Passw0rd!123',
//   });

//   const res = http.post(`${BASE}/auth/signUp`, payload, {
//     headers: { 'Content-Type': 'application/json' },
//   });

//   check(res, { 'status 201': (r) => r.status === 201 });
//   sleep(1);
// }

// import http from 'k6/http';
// import { check, sleep } from 'k6';

// const BASE = __ENV.BASE_URL || 'http://localhost:3100';

// export const options = {
//   stages: [
    // Load test 
    // { duration: '1m', target: 5 },   // Ramp-up to 5 virtual users over 1 minutes
    // { duration: '5m', target: 5 },   // hold for 5 minutes
    // { duration: '1m', target: 0 },

    //Stress test 
    //{ duration: '2m', target: 50 },   // Ramp-up to 50 virtual users over 2 minutes
    //{ duration: '5m', target: 100 },  // Increase to 100 VUs and hold for 5 minutes
    //{ duration: '5m', target: 200 },  // Push to peak stress (200 VUs) for 5 minutes
    //{ duration: '2m', target: 0 },  

//     { duration: '1m', target: 10 },  { duration: '2m', target: 10 },
//     { duration: '1m', target: 25 },  { duration: '2m', target: 25 },
//     { duration: '1m', target: 50 },  { duration: '2m', target: 50 },
//     { duration: '1m', target: 100 }, { duration: '2m', target: 100 },
//     { duration: '1m', target: 5 },   { duration: '4m', target: 5 }, 
//   ],
//   thresholds: {
//     http_req_duration: ['p(95)<500'],
//     http_req_failed: ['rate<0.01'],
//   },
// };

// function level(name, vus, startTime) {
//   return {
//     executor: 'constant-vus',
//     vus,
//     duration: '3m',
//     startTime,
//     tags: { level: name },
//   };
// }

// export const options = {
//   scenarios: {
//     l5:   level('5vu',   5,   '0s'),
//     l10:  level('10vu',  10,  '3m'),
//     l20:  level('20vu',  20,  '6m'),
//     l40:  level('40vu',  40,  '9m'),
//     l80:  level('80vu',  80,  '12m'),
//     rec:  level('recovery', 5, '15m'),
//   },
//   thresholds: {
//     // dummy thresholds: inse per-level numbers summary me dikhte hain
//     'http_req_duration{level:5vu}':       ['p(95)<999999'],
//     'http_req_duration{level:10vu}':      ['p(95)<999999'],
//     'http_req_duration{level:20vu}':      ['p(95)<999999'],
//     'http_req_duration{level:40vu}':      ['p(95)<999999'],
//     'http_req_duration{level:80vu}':      ['p(95)<999999'],
//     'http_req_duration{level:recovery}':  ['p(95)<999999'],
//     'http_reqs{level:5vu}':               ['count>=0'],
//     'http_reqs{level:10vu}':              ['count>=0'],
//     'http_reqs{level:20vu}':              ['count>=0'],
//     'http_reqs{level:40vu}':              ['count>=0'],
//     'http_reqs{level:80vu}':              ['count>=0'],
//     'http_reqs{level:recovery}':          ['count>=0'],
//   },
// };

// export default function () {
//   const userNum = `${__VU}_${__ITER}`;

//   const payload = JSON.stringify({
//     first_name: 'Load',
//     last_name: 'Test',
//     email: `loaduser_${userNum}@example.com`,
//     password: 'Passw0rd!123',
//   });

//   const res = http.post(`${BASE}/auth/signUp`, payload, {
//     headers: { 'Content-Type': 'application/json' },
//   });

//   check(res, { 'status 201': (r) => r.status === 201 });
//   if (res.status !== 201) {
//     console.log(`FAIL status=${res.status} body=${res.body}`);
//   }
//   sleep(0.1);
// }
import http from 'k6/http';
import exec from 'k6/execution';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3100';
const PASSWORD = 'Test@1234';

const NAMES = [];
for (let i = 1; i <= 5; i++) NAMES.push(`maxuser_${i}`);
for (let i = 1; i <= 30; i++) NAMES.push(`prouser_${i}`);
NAMES.push('freeuser_1');

export const options = {
  scenarios: {
    create: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: NAMES.length,
      maxDuration: '5m',
    },
  },
};

export default function () {
  const name = NAMES[exec.scenario.iterationInTest];
  const res = http.post(
    `${BASE_URL}/auth/signUp`,
    JSON.stringify({
      email: `${name}@example.com`,
      password: PASSWORD,
     first_name: 'test',
     last_name : 'user'
    }),
    { headers: { 'Content-Type': 'application/json' }, timeout: '30s' },
  );
  const bad = res.status >= 400 && res.status !== 409;
  console.log(`${name} -> ${res.status}${bad ? ' ' + String(res.body).slice(0, 150) : ''}`);
}