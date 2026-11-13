import { spawn } from 'node:child_process';
    import path from 'node:path';

    export function startK6() {
      const cwd = process.cwd();

      const runId =
        process.env.RUN_ID || `migration-${Date.now()}`;

      const summaryPath = `/work/results/${runId}-summary.json`;

      const uid = process.getuid ? process.getuid() : 1000;
      const gid = process.getgid ? process.getgid() : 1000;

      const args = [
        'run',
        '--rm',
        `--name=bg-k6-${runId}`,
        '--network=host',
        '--user',
        `${uid}:${gid}`,
        '-v',
        `${cwd}:/work`,
        '-w',
        '/work',
        '-e',
        `RUN_ID=${runId}`,
        '-e',
        `RATE=${process.env.RATE || 3}`,
        '-e',
        `DURATION=${process.env.DURATION || '2m'}`,
        '-e',
        `BASE_URL=${process.env.BASE_URL || 'http://127.0.0.1:8088'}`,
        'grafana/k6:latest',
        'run',
        '--summary-export',
        summaryPath,
        'k6/bluegreen.js',
      ];

      console.log('\nStarting k6 load test');

      const child = spawn('docker', args, {
        cwd,
        stdio: 'inherit',
      });

      let stopping = false;

      const done = new Promise((resolve, reject) => {
        child.on('error', reject);

        child.on('close', (code, signal) => {
          if (code === 0 || stopping) {
            console.log(`k6 stopped. Exit code: ${code}`);
            resolve();
            return;
          }

          reject(
            new Error(`k6 failed. Exit code: ${code}, signal: ${signal}`)
          );
        });
      });

      // Attach a handler now, while the migration phases are running.
      done.catch(() => {});

      return {
        child,
        done,
        assertRunning() {
          if (child.exitCode !== null || child.signalCode !== null) {
            throw new Error('k6 exited before the migration sequence finished');
          }
        },
        async stop() {
          if (child.exitCode !== null || child.signalCode !== null) {
            return done;
          }

          stopping = true;

          console.log('\nStopping k6 gracefully...');

          child.kill('SIGINT');

          let timer;

          try {
            await Promise.race([
              done,
              new Promise((_, reject) => {
                timer = setTimeout(
                  () => reject(new Error('k6 did not stop within 15 seconds')),
                  15000
                );
              }),
            ]);
          } finally {
            clearTimeout(timer);
          }
        },
      };
    }