
import * as path from 'path';
import * as dotenv from 'dotenv';
import { ConnectionOptions } from 'bullmq';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const redisConnection : ConnectionOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  db: Number(process.env.REDIS_DB) || 0,
};
