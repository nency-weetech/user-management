import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ClassSerializerInterceptor,
  InternalServerErrorException,
  ValidationPipe,
} from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import { LoggerUserInterceptor, winstonConfig } from '@myapp/shared';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
    rawBody: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: 'http://localhost:8080',
    credentials: true,
  });

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('User Management & News Api')
      .setDescription('API documentation')
      .addCookieAuth('accessToken')
      .addCookieAuth('refreshToken')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-doc', app, document);
  }
  app.use(cookieParser());

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  // app.useGlobalInterceptors(new LoggingInterceptor())

  // const logger = await app.resolve(AppLoggerService)
  // console.log(logger.getCount())
  // app.useLogger(logger)
  // app.useGlobalInterceptors(new LoggingInterceptor())
  app.useGlobalInterceptors(new LoggerUserInterceptor());

  await app.listen(process.env.PORT ?? 3100);
}
bootstrap();
