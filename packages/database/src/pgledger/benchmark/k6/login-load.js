// import http from 'k6/http';
// import { check, sleep } from 'k6';

// export const options = {
//   scenarios: {
//     concurrent_login: {
//       executor: 'constant-vus',
//       vus: 5,
//       duration: '1m',
//     },
//   },
//   thresholds: {
//     http_req_failed: ['rate<0.01'],
//   },
// };

// const BASE_URL = __ENV.BASE_URL || 'http://localhost:3100';
// const EMAIL = __ENV.LOGIN_EMAIL || 'testaccount@example.com';
// const PASSWORD = __ENV.LOGIN_PASSWORD || 'testPass0@!123';

// export default function () {
//   const response = http.post(
//     `${BASE_URL}/auth/login`,
//     JSON.stringify({
//       email: EMAIL,
//       password: PASSWORD,
//     }),
//     {
//       headers: { 'Content-Type': 'application/json' },
//       tags: { endpoint: 'login' },
//     },
//   );

//   check(response, {
//     'login successful': (r) => r.status === 200,
//   });

//   sleep(1);
// }


import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';
import { SharedArray } from 'k6/data';
import exec from 'k6/execution';

const loginSuccessRate = new Rate('login_success_rate');

// Aapke signup script se jo exact users DB me bane hain, unki list:
const registeredUsers = new SharedArray('registered_users', function () {
  const users = [];
  // Correct loop bounds: iter goes from 0 to 4 (5 iterations total)
  for (let vu = 1; vu <= 10; vu++) {
    for (let iter = 0; iter < 5; iter++) { // ← Changed <= to <
      users.push(`loaduser_${vu}_${iter}@example.com`);
    }
  }
  return users;
});

export const options = {
  stages: [
    { duration: '30s', target: 5 },
    { duration: '2m',  target: 5 },
    { duration: '30s', target: 0 },
  ],
  summaryTrendStats: ['avg', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
};

const BASE_URL = 'http://localhost:3100';

export default function () {
  // Saare VUs in 30 registered users me se baari-baari select karenge (No 401 error)
  const userIndex = exec.scenario.iterationInTest % registeredUsers.length;
  const userEmail = registeredUsers[userIndex];

  const loginPayload = JSON.stringify({
    email: userEmail,
    password: 'Passw0rd!123',
  });

  const headers = {
    'Content-Type': 'application/json',
  };

  const res = http.post(`${BASE_URL}/auth/login`, loginPayload, { headers });

  const isSuccessful = check(res, {
    'status is 201 Created': (r) => r.status === 201,
    'has accessToken cookie': (r) => r.cookies['accessToken'] !== undefined,
    'has refreshToken cookie': (r) => r.cookies['refreshToken'] !== undefined,
  });

  loginSuccessRate.add(isSuccessful);

  if (!isSuccessful) {
    console.error(`Login failed for ${userEmail}. Status: ${res.status}`);
  }

 for (let i = 0; i < 4; i++) {
    const refreshRes = http.get(`${BASE_URL}/auth/refresh`);
    check(refreshRes, { 'refresh status 200': (r) => r.status === 200 });
    sleep(Math.random() * 1 + 0.5);
  }
}