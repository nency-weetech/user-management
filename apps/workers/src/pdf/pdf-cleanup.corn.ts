import { PdfCleanupService } from '@myapp/shared';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class PdfCleanupCorn {
  private readonly logger = new Logger(PdfCleanupCorn.name);
  constructor(private readonly pdfCleanupService: PdfCleanupService) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleCleanup() {
    this.logger.log('Start PDF cleanup');
    try {
      await this.pdfCleanupService.cleanup();
      this.logger.log('PDF cleanup completed');
    } catch (error) {
      this.logger.error(
        'PDF cleanup failed',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
