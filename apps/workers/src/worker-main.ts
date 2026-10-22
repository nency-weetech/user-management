import 'reflect-metadata';

import { NestFactory } from '@nestjs/core/nest-factory';
import { WorkerModule } from './worker.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from '@myapp/shared';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });
  // const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  //   WorkerModule,
  //   {
  //     transport: Transport.KAFKA,
  //     options: {
  //       client: {
  //         brokers: ['localhost:9092'],
  //       },
  //       consumer: {
  //         groupId: 'worker-onboarding-consumer',
  //       },
  //     },
  //     logger: WinstonModule.createLogger(winstonConfig),
  //   },
  // );

  // await app.listen();
  // console.log(
  //   'Background Worker Microservice is listening to raw Kafka events...',
  // );
}

bootstrap();
