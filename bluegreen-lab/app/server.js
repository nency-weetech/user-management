const express = require('express');
const { Pool } = require('pg');
const { randomUUID } = require('crypto');

const APP_VERSION = process.env.APP_VERSION || 'V1';
const SERVER_NAME = process.env.SERVER_NAME || 'unknown';
const HOST_PORT = Number(process.env.HOST_PORT || 0);

if (!['V1', 'V2', 'V3'].includes(APP_VERSION)) {
  throw new Error(`Invalid APP_VERSION: ${APP_VERSION}`);
}

const pool = new Pool({
  connectionString: process.env.BG_DB_URL,
  max: 10,
  application_name: SERVER_NAME,
});

// async function log(rid) {
//   const requestId = rid || randomUUID();
//   const { rows } = await pool.query(
//     `INSERT INTO bg_request_log
//        (request_id, server_name, server_port, app_pid, db_backend_pid)
//      VALUES ($1,$2,$3,$4,pg_backend_pid())
//      RETURNING id, handled_at`,
//     [requestId, SERVER_NAME, HOST_PORT, process.pid],
//   );
//   return { server: SERVER_NAME, requestId, ...rows[0] };
// }

async function insertV1(requestId) {
  const result = await pool.query(
    `INSERT INTO bg_request_log
      (request_id, server_name, server_port, app_pid, db_backend_pid, handled_at)
     VALUES ($1, $2, $3, $4, pg_backend_pid(), NOW())
     RETURNING *`,
    [requestId, SERVER_NAME, HOST_PORT, process.pid],
  );

  return result.rows[0];
}

async function insertV2(requestId) {
  const payload = {
    legacy_id: requestId,
  };

  const result = await pool.query(
    `INSERT INTO bg_request_log
      (request_id, payload, server_name, server_port, app_pid, db_backend_pid, handled_at)
     VALUES ($1, $2::jsonb, $3, $4, $5, pg_backend_pid(), NOW())
     RETURNING *`,
    [requestId, JSON.stringify(payload), SERVER_NAME, HOST_PORT, process.pid],
  );

  return result.rows[0];
}

async function insertV3(requestId) {
  const payload = {
    legacy_id: requestId,
  };

  const result = await pool.query(
    `INSERT INTO bg_request_log
      (payload, server_name, server_port, app_pid, db_backend_pid, handled_at)
     VALUES ($1::jsonb, $2, $3, $4, pg_backend_pid(), NOW())
     RETURNING *`,
    [JSON.stringify(payload), SERVER_NAME, HOST_PORT, process.pid],
  );

  return result.rows[0];
}

async function logRequest(requestId) {
  switch (APP_VERSION) {
    case 'V1':
      return insertV1(requestId);

    case 'V2':
      return insertV2(requestId);

    case 'V3':
      return insertV3(requestId);

    default:
      throw new Error(`Unsupported version: ${APP_VERSION}`);
  }
}

const app = express();

app.use((req, res, next) => {
  res.setHeader('X-Served-By', SERVER_NAME);
  next();
});

app.get('/bg-test/ping', async (req, res) => {
  const requestId = req.get('x-request-id') || randomUUID();

  try {
    const row = await logRequest(requestId);
    res.json({
      success: true,
      requestId,
      server: SERVER_NAME,
      version: APP_VERSION,
      databaseRow: row,
    });
  } catch (error) {
    console.error('Request failed:', {
      requestId,
      server: SERVER_NAME,
      version: APP_VERSION,
      error: error.message,
    });

    res.status(500).json({
      success: false,
      requestId,
      server: SERVER_NAME,
      version: APP_VERSION,
      error: error.message,
    });
  }
});

app.get('/bg-test/slow', async (req, res) => {
  try {
    await pool.query('SELECT pg_sleep(2)');
    const requestId = req.get('x-request-id') || randomUUID();
    const row = await logRequest(requestId);
    res.set('X-Served-By', SERVER_NAME).json({
      success: true,
      requestId,
      server: SERVER_NAME,
      version: APP_VERSION,
      databaseRow: row,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/healthz', (req, res) => res.send('ok')); // no DB write

const server = app.listen(process.env.PORT || 3000, '0.0.0.0');
process.on('SIGTERM', () =>
  server.close(() => pool.end().then(() => process.exit(0))),
);
