const { runCommand } = require('./command');

async function runMigration(phase) {
  const allowed = ['expand', 'backfill', 'verify', 'contract'];

  if (!allowed.includes(phase)) {
    throw new Error(`Unknown migration phase: ${phase}`);
  }

  console.log(`\n========== ${phase.toUpperCase()} MIGRATION ==========`);

  const env = {
    ...process.env,
  };

  if (phase === 'contract') {
    env.CONFIRM_CONTRACT = 'true';
  }

  await runCommand(
    'node',
    ['migration/migrate.js', phase],
    { env }
  );

  console.log(`${phase.toUpperCase()} completed successfully`);
}

module.exports = { runMigration };