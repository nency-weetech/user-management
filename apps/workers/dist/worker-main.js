"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const nest_factory_1 = require("@nestjs/core/nest-factory");
const worker_module_1 = require("./worker.module");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const logger = new common_1.Logger('WorkerBootstrap');
    const app = await nest_factory_1.NestFactory.createApplicationContext(worker_module_1.WorkerModule);
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
