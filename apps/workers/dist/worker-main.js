"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const nest_factory_1 = require("@nestjs/core/nest-factory");
const worker_module_1 = require("./worker.module");
const shared_1 = require("@myapp/shared");
async function bootstrap() {
    // const logger = new Logger('WorkerBootstrap');
    const app = await nest_factory_1.NestFactory.createApplicationContext(worker_module_1.WorkerModule);
    const logger = await app.resolve(shared_1.AppLoggerService);
    app.useLogger(logger);
    // logger.log('Worker process started - listening for BullMQ jobs...');
    // process.on('SIGTERM', async () => {
    //   logger.log('SIGTERM received, shutting down worker gracefully...');
    //   await app.close();
    //   process.exit(0);
    // });
    // process.on('SIGINT', async () => {
    //   logger.log('SIGINT received, shutting down worker gracefully...');
    //   await app.close();
    //   process.exit(0);
    // });
}
bootstrap();
