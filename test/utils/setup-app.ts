import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import cookieParser from 'cookie-parser';

import { DataSource } from 'typeorm';
import { testDbConfig } from '../config/test-db.config';
import { AppModule } from '../../src/app.module';
import { MailService } from 'src/mail/mail.service';

export const mailCapture = {
  lastVerificationOtp: null as string | null,
  lastResetOtp: null as string | null,
  lastWelcomeEmail : null as string | null
};

export async function setUpApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(MailService)
    .useValue({
      sendVerificationOtpEmail: async (email: string, otp: string) => {
        mailCapture.lastVerificationOtp = otp;
      },
      sendResetPassOtpEmail: async (email: string, otp: string) => {
        mailCapture.lastResetOtp = otp;
      },
      welcomeMail: async (email: string) => {
        mailCapture.lastWelcomeEmail = email;
      },
    })
    .compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use(cookieParser());
  await app.init();

  return app;
}

export async function closeTestApp(app: INestApplication): Promise<void> {
  const datasource = app.get<DataSource>(getDataSourceToken());
  await datasource.destroy();
  await app.close();
}
