const express = require('express');
const { Pool } = require('pg');
const { randomUUID } = require('crypto');

const SERVER_NAME = process.env.SERVER_NAME || 'unknown';
const HOST_PORT = Number(process.env.HOST_PORT || 0);
const pool = new Pool({
  connectionString: process.env.BG_DB_URL,
  max: 10,
  application_name: SERVER_NAME,
});

async function log(rid) {
  const requestId = rid || randomUUID();
  const { rows } = await pool.query(
    `INSERT INTO bg_request_log
       (request_id, server_name, server_port, app_pid, db_backend_pid)
     VALUES ($1,$2,$3,$4,pg_backend_pid())
     RETURNING id, handled_at`,
    [requestId, SERVER_NAME, HOST_PORT, process.pid],
  );
  return { server: SERVER_NAME, requestId, ...rows[0] };
}

const app = express();

app.get('/bg-test/ping', async (req, res) => {
  try {
    res.set('X-Served-By', SERVER_NAME).json(await log(req.get('x-request-id')));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/bg-test/slow', async (req, res) => {
  try {
    await pool.query('SELECT pg_sleep(2)');
    res.set('X-Served-By', SERVER_NAME).json(await log(req.get('x-request-id')));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/healthz', (req, res) => res.send('ok'));   // no DB write

const server = app.listen(process.env.PORT || 3000, '0.0.0.0');
process.on('SIGTERM', () =>
  server.close(() => pool.end().then(() => process.exit(0))));