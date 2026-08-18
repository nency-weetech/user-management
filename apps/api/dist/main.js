"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const swagger_1 = require("@nestjs/swagger");
const nest_winston_1 = require("nest-winston");
const shared_1 = require("@myapp/shared");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: nest_winston_1.WinstonModule.createLogger(shared_1.winstonConfig),
        rawBody: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    if (process.env.NODE_ENV !== 'production') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('User Management & News Api')
            .setDescription('API documentation')
            .addCookieAuth('accessToken')
            .addCookieAuth('refreshToken')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api-doc', app, document);
    }
    app.use((0, cookie_parser_1.default)());
    app.useGlobalInterceptors(new common_1.ClassSerializerInterceptor(app.get(core_1.Reflector)));
    // app.useGlobalInterceptors(new LoggingInterceptor())
    // const logger = await app.resolve(AppLoggerService)
    // console.log(logger.getCount())
    // app.useLogger(logger)
    // app.useGlobalInterceptors(new LoggingInterceptor())
    app.useGlobalInterceptors(new shared_1.LoggerUserInterceptor());
    await app.listen(process.env.PORT ?? 3100);
}
bootstrap();
//# sourceMappingURL=main.js.map