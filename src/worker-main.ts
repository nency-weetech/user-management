import 'reflect-metadata';

import { NestFactory } from "@nestjs/core/nest-factory";
import { AppModule } from "./app.module";
import { WorkerModule } from './worker.module';

async function bootstrap(){
    const app = await NestFactory.createApplicationContext(WorkerModule)
    console.log('Worker process started - listening for jobs...');
}

bootstrap();