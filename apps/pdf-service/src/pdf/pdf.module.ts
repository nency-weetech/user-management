import { PdfJob } from '@myapp/database';
import { BrowserService, LoggerModule, PdfRenderService, StorageService } from '@myapp/shared';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PdfController } from './pdf.controller';
import { ServiceKeyGuard } from '../security/service-key.guard';
import { PdfService } from './pdf.service';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

@Module({
  imports: [
      TypeOrmModule.forFeature([PdfJob]),
      LoggerModule,
      BullModule.registerQueue({ name: 'pdfQueue' }),
      BullBoardModule.forFeature({
        name: 'pdfQueue',
        adapter: BullMQAdapter,
      }),
  ],
  controllers: [PdfController],
  providers: [
    StorageService,
    PdfRenderService,
    BrowserService,
    PdfService,
    ServiceKeyGuard,
  ],
})
export class PdfModule {}
