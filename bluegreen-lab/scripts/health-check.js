import http from 'node:http';

const HOST = process.env.APP_HOST || '127.0.0.1';

const PORTS = {
  blue: 4001,
  green: 4002,
};

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function request(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      res.resume();

      resolve({
        statusCode: res.statusCode,
        headers: res.headers,
      });
    });

    req.setTimeout(3000, () => {
      req.destroy(new Error('Request timeout'));
    });

    req.on('error', reject);
  });
}

const BASE_URL = process.env.BASE_URL || 'http://localhost:8088';

export function getServedByServer() {
  return new Promise((resolve, reject) => {
    const req = http.get(`${BASE_URL}/healthz`, (res) => {
      const server = res.headers['x-served-by'];

      res.resume(); 
      if (res.statusCode !== 200) {
        reject(new Error(`Health request failed: ${res.statusCode}`));
        return;
      }

      if (!server) {
        reject(new Error('X-Served-By header missing'));
        return;
      }

      resolve(server);
    });

    req.setTimeout(3000, () => {
      req.destroy(new Error('Health request timed out'));
    });

    req.on('error', reject);
  });
}

export async function checkHealth(target) {
  const port = PORTS[target];

  if (!port) {
    throw new Error(`Unknown application: ${target}`);
  }

  const url = `http://${HOST}:${port}/healthz`;
  const timeout = Number(process.env.HEALTH_TIMEOUT_MS || 60000);
  const interval = 2000;
  const startedAt = Date.now();

  console.log(`Checking ${target} health: ${url}`);

  while (Date.now() - startedAt < timeout) {
    try {
      const response = await request(url);

      if (response.statusCode === 200) {
        console.log(`${target} is healthy`);
        return;
      }
    } catch {
      // Retry until timeout.
    }

    await sleep(interval);
  }

  throw new Error(`${target} did not become healthy within ${timeout}ms`);
}

export async function checkTraffic(
  target,
  { timeoutMs = 10000, intervalMs = 250, requiredSuccesses = 5 } = {},
) {
  const start = Date.now();
  let consecutiveSuccesses = 0;
  let lastServer = null;

  while (Date.now() - start < timeoutMs) {
    const server = await getServedByServer();
    lastServer = server;

    if (server === target) {
      consecutiveSuccesses++;

      if (consecutiveSuccesses >= requiredSuccesses) {
        console.log(`Traffic successfully switched to ${target}`);
        return;
      }
    } else {
      consecutiveSuccesses = 0;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(
    `Traffic switch to ${target} not verified. Last server: ${lastServer}`,
  );
}
