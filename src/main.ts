import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    }),
  );

  if(process.env.NODE_ENV !== 'production'){
    const config = new DocumentBuilder()
    .setTitle('User Management & News Api')
    .setDescription('API documentation')
    .addCookieAuth('accessToken')
    .addCookieAuth('refreshToken')
    .build()

    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api-doc', app, document);
  }
  app.use(cookieParser())
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
  await app.listen(process.env.PORT ?? 3100);
}
bootstrap();
