import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { runCommand } from './command.js';
import { checkHealth, checkTraffic, sleep } from './health-check.js';
import { deploy, getVersions } from './deployment.js';
import { runMigration } from './migration.js';
import { startK6 } from './k6-runner.js';

const RESULTS_DIR = path.join(process.cwd(), 'results');

const LOG_FILE = path.join(RESULTS_DIR, 'orchestration.jsonl');

const DRAIN_SECONDS = Number(process.env.DRAIN_SECONDS || 15);

let k6Process = null;

function logPhase(phase, status, details = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    phase,
    status,
    ...details,
  };

  fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n');

  console.log('\n', entry);
}

async function phase(name, callback) {
  console.log(`\n========== ${name} ==========`);

  logPhase(name, 'STARTED');

  try {
    k6Process?.assertRunning();

    const result = await callback();

    logPhase(name, 'SUCCESS', {
      versions: getVersions(),
    });

    return result;
  } catch (error) {
    logPhase(name, 'FAILED', {
      error: error.message,
    });

    throw error;
  }
}

async function preflight() {
  const requiredFiles = [
    'docker-compose.yml',
    'migration/migrate.js',
    'scripts/switch.sh',
    'k6/bluegreen.js',
    'nginx/conf.d/active_upstream.conf',
    'nginx/upstreams/blue.conf',
    'nginx/upstreams/green.conf',
  ];

  for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(process.cwd(), file))) {
      throw new Error(`Required file not found: ${file}`);
    }
  }

  await runCommand('docker', ['compose', 'ps']);

  await runCommand('docker', ['exec', 'bg-nginx', 'nginx', '-t']);
  await runCommand('docker', [
    'exec',
    'bg-lab-postgres',
    'psql',
    '-U',
    'lab',
    '-d',
    'labdb',
    '-c',
    'TRUNCATE TABLE bg_request_log;',
  ]);

  await checkHealth('blue');
  await checkHealth('green');

  await checkTraffic('blue');

  console.log('\nPreflight checks passed');
}

async function switchTraffic(target) {
  await runCommand('bash', ['scripts/switch.sh', target]);

  await checkTraffic(target);
}

async function waitForDrain(oldTarget) {
  console.log(`Waiting ${DRAIN_SECONDS}s before retiring ${oldTarget}`);

  await sleep(DRAIN_SECONDS * 1000);

  console.log(`${oldTarget} drain grace period completed`);
}

async function approveContract() {
  console.log('\n========== CONTRACT APPROVAL ==========');

  const versions = getVersions();

  if (versions.blue !== 'V3' || versions.green !== 'V3') {
    throw new Error('Contract blocked: both applications must run V3');
  }

  await checkHealth('blue');
  await checkHealth('green');
  await checkTraffic('green');

  console.log('\nBoth applications are running V3.');
  console.log('The contract migration will permanently drop request_id.');

  if (!stdin.isTTY) {
    throw new Error('Contract approval requires an interactive terminal.');
  }

  const rl = readline.createInterface({
    input: stdin,
    output: stdout,
  });

  try {
    const answer = await rl.question('\nType CONTRACT to approve: ');
    console.log('orch contract answer : ', answer);
    if (answer.trim() !== 'CONTRACT') {
      throw new Error('Contract approval rejected');
    }
  } finally {
    rl.close();
  }

  console.log('Contract approved');
}

async function runFlow() {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });

  await phase('PREFLIGHT', preflight);

  await phase('START_K6', async () => {
    k6Process = startK6();

    // Give Docker/k6 time to start and fail early if it cannot.
    await sleep(3000);

    k6Process.assertRunning();
  });

  // 1. Expand schema.
  await phase('EXPAND', async () => {
    await runMigration('expand');
  });

  await sleep(4000);
  // 2. Deploy Green V2 while Blue serves traffic.
  await phase('DEPLOY_GREEN_V2', async () => {
    await deploy('green', 'V2');
  });

  // 3. Switch traffic to Green V2.
  await phase('SWITCH_TO_GREEN_V2', async () => {
    await switchTraffic('green');
    await waitForDrain('blue');
  });

  // 4. Backfill and verify.
  await phase('BACKFILL', async () => {
    await runMigration('backfill');
  });

  await phase('VERIFY_AFTER_BACKFILL', async () => {
    await runMigration('verify');
  });

  // 5. Deploy Blue V3 and switch to Blue.
  await phase('DEPLOY_BLUE_V3', async () => {
    await deploy('blue', 'V3');
  });

  await phase('SWITCH_TO_BLUE_V3', async () => {
    await switchTraffic('blue');
    await waitForDrain('green');
  });

  // 6. Deploy Green V3 and switch back to Green.
  await phase('DEPLOY_GREEN_V3', async () => {
    await deploy('green', 'V3');
  });

  await phase('SWITCH_TO_GREEN_V3', async () => {
    await switchTraffic('green');
    await waitForDrain('blue');
  });

  // 7. Verify once more before contract.
  await phase('FINAL_VERIFY', async () => {
    await runMigration('verify');
  });

  // 8. Require explicit approval before dropping old column.
  await phase('CONTRACT_APPROVAL', approveContract);

  await phase('CONTRACT', async () => {
    await runMigration('contract');
  });

  // 9. Observe the system after contract.
  await phase('POST_MIGRATION_OBSERVATION', async () => {
    const seconds = Number(process.env.POST_CONTRACT_OBSERVATION_SECONDS || 30);

    console.log(`Observing system for ${seconds} seconds`);

    await checkTraffic('green');
    await sleep(seconds * 1000);
    await checkTraffic('green');
  });

  if (k6Process) {
    console.log('\nWaiting for k6 load test to complete remaining duration...');
    await k6Process.done;
  }
  console.log('\nALL MIGRATION PHASES COMPLETED');
}

async function main() {
  try {
    await runFlow();

    logPhase('ORCHESTRATION', 'SUCCESS');
  } catch (error) {
    console.error('\nORCHESTRATION FAILED:', error);

    logPhase('ORCHESTRATION', 'FAILED', {
      error: error.message,
    });

    process.exitCode = 1;
  } finally {
    if (k6Process) {
      try {
        await k6Process.stop();
      } catch (error) {
        console.error('Could not stop k6 cleanly:', error.message);
        process.exitCode = 1;
      }
    }
  }
}

main();
