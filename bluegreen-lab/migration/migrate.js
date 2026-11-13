import 'dotenv/config';
import pg from 'pg';
const { Client } = pg;

const MIGRATION_DATABASE_URL = process.env.MIGRATION_DATABASE_URL;
if (!MIGRATION_DATABASE_URL) {
  throw new Error('MIGRATION_DATABASE_URL is required');
}
const BATCH_SIZE = Number(process.env.BATCH_SIZE || 1000);

async function withClient(callback) {
  const client = new Client({
    connectionString: MIGRATION_DATABASE_URL,
    application_name: 'bluegreen-migration',
  });

  await client.connect();

  try {
    await callback(client);
  } finally {
    await client.end();
  }
}

//EXPAND
async function expand() {
  await withClient(async (client) => {
    await client.query('BEGIN');

    try {
      await client.query(`SET LOCAL lock_timeout = '3s'`);

      await client.query(`
        ALTER TABLE bg_request_log
        ADD COLUMN IF NOT EXISTS payload JSONB
      `);

      await client.query(`
        ALTER TABLE bg_request_log
        ALTER COLUMN request_id DROP NOT NULL
      `);

      await client.query('COMMIT');

      console.log('EXPAND completed successfully');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  });
}

//BACKFILL
async function backfill() {
  await withClient(async (client) => {
    let totalUpdated = 0;

    while (true) {
      const result = await client.query(
        `
        WITH batch AS (
          SELECT id
          FROM bg_request_log
          WHERE payload IS NULL
            AND request_id IS NOT NULL
          ORDER BY id
          LIMIT $1
        )
        UPDATE bg_request_log AS target
        SET payload = jsonb_build_object(
          'legacy_id',
          target.request_id
        )
        FROM batch
        WHERE target.id = batch.id
          AND target.payload IS NULL
        RETURNING target.id
        `,
        [BATCH_SIZE],
      );

      const updated = result.rowCount;
      totalUpdated += updated;

      console.log(`Backfill batch: ${updated} rows | Total: ${totalUpdated}`);

      if (updated === 0) {
        break;
      }

      // Small pause to reduce continuous database pressure.
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(`BACKFILL completed. Total updated: ${totalUpdated}`);
  });
}

//VERIFY
async function verify() {
  await withClient(async (client) => {
    const result = await client.query(`
      SELECT
        COUNT(*) FILTER (
          WHERE payload IS NULL
        ) AS null_payload,

        COUNT(*) FILTER (
          WHERE request_id IS NOT NULL
            AND payload->>'legacy_id' IS DISTINCT FROM request_id
        ) AS mismatched_ids,

        COUNT(*) AS total_rows

      FROM bg_request_log
    `);

    const stats = result.rows[0];

    console.log('Verification result:', stats);

    if (Number(stats.null_payload) > 0 || Number(stats.mismatched_ids) > 0) {
      throw new Error('Verification failed. Do not proceed to V3 or Contract.');
    }

    console.log('VERIFY passed');
  });
}

//CONTRACT
async function contract() {
  if (process.env.CONFIRM_CONTRACT !== 'true') {
    throw new Error(
      'Set CONFIRM_CONTRACT=true only after both Blue and Green run V3.',
    );
  }

  await withClient(async (client) => {
    await client.query('BEGIN');

    try {
      await client.query(`SET LOCAL lock_timeout = '3s'`);

      // Final safety check while holding the table lock.
      await client.query(`
        LOCK TABLE bg_request_log IN ACCESS EXCLUSIVE MODE
      `);

      const result = await client.query(`
        SELECT
          COUNT(*) FILTER (
            WHERE payload IS NULL
          ) AS null_payload,

          COUNT(*) FILTER (
            WHERE request_id IS NOT NULL
              AND payload->>'legacy_id' IS DISTINCT FROM request_id
          ) AS mismatched_ids

        FROM bg_request_log
      `);

      const stats = result.rows[0];

      if (Number(stats.null_payload) > 0 || Number(stats.mismatched_ids) > 0) {
        throw new Error('Contract blocked: payload verification failed.');
      }

      await client.query(`
        ALTER TABLE bg_request_log
        DROP COLUMN request_id
      `);

      await client.query('COMMIT');

      console.log('CONTRACT completed. request_id dropped.');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  });
}

async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'expand':
      await expand();
      break;

    case 'backfill':
      await backfill();
      break;

    case 'verify':
      await verify();
      break;

    case 'contract':
      await contract();
      break;

    default:
      console.log(`
Usage:
  node migrate.js expand
  node migrate.js backfill
  node migrate.js verify
  CONFIRM_CONTRACT=true node migrate.js contract
      `);
      process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('Migration failed:', error);
  process.exitCode = 1;
});
