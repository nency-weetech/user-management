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



import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE = __ENV.BASE_URL || 'http://localhost:3100'; 

export const options = {
  vus: 10,
  iterations: 50,
};

export default function () {
  const userNum = `${__VU}_${__ITER}`;
  
  const payload = JSON.stringify({
    first_name: 'Load',
    last_name: 'Test',
    email: `loaduser_${userNum}@example.com`,
    password: 'Passw0rd!123',
  });

  const res = http.post(`${BASE}/auth/signUp`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, { 'status 201': (r) => r.status === 201 });
  sleep(0.1);
}