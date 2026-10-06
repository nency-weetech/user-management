import 'reflect-metadata';
import { NestFactory } from '@nestjs/core/nest-factory';
import { WorkerModule } from './worker.module';
import {WinstonModule} from 'nest-winston';import { winstonConfig } from '@myapp/shared';
import { ValidationPipe } from '@nestjs/common';
import { json } from 'express';


async function bootstrap() {
  const app = await NestFactory.create(WorkerModule, {
    logger : WinstonModule.createLogger(winstonConfig)
  });

  app.use(json({limit: '600kb'}));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(
    Number(process.env.PDF_SERVICE_PORT ?? 3200),
    process.env.PDF_SERVICE_HOST ?? '127.0.0.1',
  );
}

bootstrap();
