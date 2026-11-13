import { spawn } from 'node:child_process';

    export function runCommand(command, args = [], options = {}) {
      return new Promise((resolve, reject) => {
        console.log(`\n$ ${command} ${args.join(' ')}`);

        const child = spawn(command, args, {
          cwd: options.cwd || process.cwd(),
          env: options.env || process.env,
          stdio: 'inherit',
          shell: false,
        });

        child.on('error', reject);

        child.on('close', (code, signal) => {
          if (code === 0) {
            resolve();
            return;
          }

          reject(
            new Error(
              `${command} failed. Exit code: ${code}, signal: ${signal}`
            )
          );
        });
      });
    }