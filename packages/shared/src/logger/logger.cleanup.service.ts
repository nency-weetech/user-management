import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import path from 'path';
import { runWithJobContext } from './context/logger.job.util';
import * as fsSync from 'fs';
import * as fs from 'fs/promises';
import * as zlib from 'zlib';
import { pipeline } from 'stream/promises';

const LOG_DIR = [
  path.resolve(process.cwd(), 'logs/error'),
  path.resolve(process.cwd(), 'logs/combined'),
];

const ZIP_AFTER_MS = 48 * 60 * 60 * 1000;
//const ZIP_AFTER_MS = 1 * 60 * 1000;
const DELETE_AFTER_MS = 30 * 24 * 60 * 60 * 1000;
//const DELETE_AFTER_MS = 1 * 60 * 1000;

@Injectable()
export class LoggerCleanupservice {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleOldZipLog() {
    await runWithJobContext({ jobName: 'ZipOldJob' }, async () => {
      for (const dir of LOG_DIR) {
        const files = await this.safeReadDir(dir);
        const now = Date.now();

        for (const file of files) {
          if (!file.endsWith('.log')) continue;

          const fullpath = path.join(dir, file);
          const stats = await fs.stat(fullpath);
          const age = now - stats.mtimeMs;

          if (age >= ZIP_AFTER_MS) {
            try {
              await this.gzipFile(fullpath);
              await fs.unlink(fullpath);
              this.logger.log('Zipped old log file', {
                function: 'LoggerCleanupService',
                meta: { file, dir },
              });
            } catch (error) {
              this.logger.error('Failed Zipped old log file', {
                function: 'LoggerCleanupService',
                meta: { file, dir },
                stack: error.stack,
              });
            }
          }
        }
      }
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handledDeleteExpiredLog() {
    await runWithJobContext({ jobName: 'DeleteExpiredLog' }, async () => {
      for (const dir of LOG_DIR) {
        const files = await this.safeReadDir(dir);
        const now = Date.now();

        for (const file of files) {
          if (!file.endsWith('.gz')) continue;

          const fullpath = path.join(dir, file);
          const stats = await fs.stat(fullpath);
          const age = now - stats.mtimeMs;

          if (age >= DELETE_AFTER_MS) {
            try {
              await fs.unlink(fullpath);
              this.logger.log('Deleted expired log file', {
                function: 'LoggerCleanupService',
                meta: { file, dir },
              });
            } catch (error) {
              this.logger.error('Failed to delete expired log file', {
                function: 'LoggerCleanupService',
                meta: { file, dir },
                stack: error.stack,
              });
            }
          }
        }
      }
    });
  }

  private async safeReadDir(dir: string): Promise<string[]> {
    try {
      return await fs.readdir(dir);
    } catch {
      return [];
    }
  }

  private async gzipFile(filePath: string): Promise<void> {
    const gzip = zlib.createGzip();
    const source = fsSync.createReadStream(filePath);
    const destination = fsSync.createWriteStream(`${filePath}.gz`);
    await pipeline(source, gzip, destination);
  }
}
