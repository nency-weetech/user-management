import 'reflect-metadata';

import { NestFactory } from '@nestjs/core/nest-factory';
import { AppModule } from './app.module';
import { WorkerModule } from './worker.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('WorkerBootstrap');
  const app = await NestFactory.createApplicationContext(WorkerModule);

  logger.log('Worker process started - listening for BullMQ jobs...');

  process.on('SIGTERM', async () => {
    logger.log('SIGTERM received, shutting down worker gracefully...');
    await app.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.log('SIGINT received, shutting down worker gracefully...');
    await app.close();
    process.exit(0);
  });
}

bootstrap();
