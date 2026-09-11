import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { AppModule } from '../../src/app.module';
import { MailService } from '../../src/mail/mail.service';
import { HttpService } from '@nestjs/axios';
import { mailCapture, newslog } from './setup-app';

export async function setUpSocketApp(): Promise<{app: INestApplication, baseUrl: string}> {
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
      sendWeeklyReportMail: async (
        email: string,
        count: number,
        users: any[],
      ) => {
        mailCapture.lastWeeklyReport = { count, users };
      },
    })
    .overrideProvider(HttpService)
    .useValue({ get: newslog.mockHttpGet })
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
  await app.listen(0);

  const address = app.getHttpServer().address();
  const port = typeof address === 'string' ? address : address?.port;
  const baseUrl = `http://localhost:${port}`;

  return { app, baseUrl };
}
