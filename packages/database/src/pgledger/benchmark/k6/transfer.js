
// /**
//  *
//  * multiple accounts
//  *
//  */

import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 50,
  duration: '10s',
};

const baseUrl = 'http://localhost:3100';

export function setup() {
  const response = http.get(`${baseUrl}/benchmark/pgledger/accounts`);

  check(response, {
    'accounts loaded': (r) => r.status === 200,
  });

  return response.json();
}

export default function (accounts) {
  const fromIndex = Math.floor(Math.random() * accounts.length);

  let toIndex = Math.floor(Math.random() * accounts.length);

  while (toIndex === fromIndex) {
    toIndex = Math.floor(Math.random() * accounts.length);
  }

  const payload = JSON.stringify({
    fromAccountId: accounts[fromIndex].account_id,
    toAccountId: accounts[toIndex].account_id,
    amount: 100,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = http.post(
    `${baseUrl}/benchmark/pgledger/transfer`,
    payload,
    params,
  );

  if (response.status !== 200 && response.status !== 201) {
    console.log(`Status: ${response.status}`);
    console.log(`Body: ${response.body}`);
  }
}

// /**
//  *
//  * 2 accounts
//  *
//  */
// const accounts = [
//   'pgla_01M3PAN2XWFW79CSH54708S9Z0',
//   'pgla_01M3P7X3SFF029TZ74FA4N3D8H',
// ];

// export default function () {
//   const payload = JSON.stringify({
//     fromAccountId: accounts[0],
//     toAccountId: accounts[1],
//     amount: 200,
//   });

//   const params = {
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   };

//   const response = http.post(`${baseurl}/benchmark/pgledger/trasfer`, payload, params);
//   if (response.status !== 201 && response.status !== 200) {
//     console.log(`Status: ${response.status}`);
//     console.log(`Body: ${response.body}`);
//   }
// }
