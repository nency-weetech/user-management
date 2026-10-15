// worker.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NewsFetcherService } from './news/news-fetcher.service';
import { ArticleRepository, OrganizationPlan, OrganizationPlanRepository, PaymentRepository, Payments, PdfJob, User, UserPlan, UserPlanRepository, UserRepository } from '@myapp/database';
import { NewsFetchLogRepository } from '@myapp/database';
import { MailProcessor } from './mail/mail.processor';
import { RedisModule } from './redis/redis.module';
import { HttpModule } from '@nestjs/axios';
import { NewsProcessor } from './news/news.fetcher.processor';
import { ConfigModule } from '@nestjs/config';
import { datasourceOptions } from '@myapp/database';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsQueueService, UsersService } from '@myapp/api';
import { NewsService } from '@myapp/api/src/news/news.service';
import { NewsRefreshCorn } from './news/news-refresh.cron';
import { NewsFetchLog } from '@myapp/database';
import { Article } from '@myapp/database';
import { BrowserService, LoggerModule, PdfCleanupService, PdfRenderService, PdfStorage, StorageService } from '@myapp/shared';
import path from 'path';
import { PaymentEventProcessor } from './billing/payment-event.processor';
import { PaymentCleanUpCron } from './billing/payment-cleanup.corn';
import { StripeInvoiceService } from './billing/stripe-invoice.service';
import { Plans_catalog } from '@myapp/database/dist/entities/plans.entity';
import { PdfProcessor } from './pdf/pdf.processor';
import { PdfCleanupCorn } from './pdf/pdf-cleanup.corn';
@Module({
  imports: [
   ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        path.resolve(__dirname, '../.env'),
        path.resolve(process.cwd(), '../../.env'),
      ],
    }),
    LoggerModule,
    TypeOrmModule.forRoot(datasourceOptions),
    TypeOrmModule.forFeature([Article, NewsFetchLog, User, Payments, UserPlan, OrganizationPlan, Plans_catalog, PdfJob]),
    RedisModule,
    HttpModule,
    BullModule.registerQueue({ name: 'newsQueue' }, { name: 'mailQueue' }, {name: 'billingQueue'}, {name: 'pdfQueue'}),
    
  ],
  providers: [
    PdfStorage,
    MailProcessor,
    PaymentEventProcessor,
    PdfCleanupService,
    PdfProcessor,
    PdfCleanupCorn,
    StorageService,
    PdfRenderService,
    BrowserService,
    StripeInvoiceService,
    PaymentRepository,
    PaymentCleanUpCron,
    UserPlanRepository,
    UserRepository,
    OrganizationPlanRepository,
    
    ArticleRepository,
    NewsFetchLogRepository,
    NewsFetcherService,
    NewsQueueService,
    NewsProcessor,
    NewsRefreshCorn,
  ],
})
export class WorkerModule {}
