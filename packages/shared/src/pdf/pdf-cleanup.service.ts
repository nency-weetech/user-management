import { PdfJob, PdfJobStatus } from '@myapp/database';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { PdfStorage } from './pdf.storage.service';

const PROCESSING_TIMEOUT_MINUTES = 10;

@Injectable()
export class PdfCleanupService {
  private readonly logger = new Logger(PdfCleanupService.name);
  constructor(
    @InjectRepository(PdfJob) private readonly jobs: Repository<PdfJob>,
    private readonly storageService: PdfStorage,
  ) {}

  async cleanup() {
    await this.cleanupExpiredReadyJobs();
    await this.cleanupStuckProcessingJobs();
  }

  async cleanupExpiredReadyJobs() {
    const now = new Date();

    const jobs = await this.jobs.find({
      where: {
        status: PdfJobStatus.READY,
        expires_at: LessThan(now),
      },
    });

    this.logger.log(`Found ${jobs.length} expired READY PDF jobs`);

    for (const job of jobs) {
      try {
        if (!job.object_key) {
          await this.jobs.update(job.id, {
            status: PdfJobStatus.EXPIRED,
          });
          this.logger.log(`PDF job expired without object: jobId=${job.id}`);

          continue;
        }

        await this.storageService.remove(job.object_key);
        await this.jobs.update(job.id, {
          status: PdfJobStatus.EXPIRED,
        });

        this.logger.log(`PDF expired and object deleted: jobId=${job.id}`);
      } catch (error) {
        this.logger.error(
          `Failed to cleanup PDF job: jobId=${job.id}, objectKey=${job.object_key}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }
  }

  async cleanupStuckProcessingJobs() {
    const timeout = new Date(
      Date.now() - PROCESSING_TIMEOUT_MINUTES * 60 * 1000,
    );

    const jobs = await this.jobs.find({
      where: {
        status: PdfJobStatus.PROCESSING,
        updated_at: LessThan(timeout),
      },
    });

    this.logger.log(`Found ${jobs.length} stuck PROCESSING PDF jobs`);

    for (const job of jobs) {
      try {
        await this.jobs.update(job.id, {
          status: PdfJobStatus.FAILED,
          error: 'timed out',
        });

        this.logger.warn(`PDF job marked as timed out: jobId=${job.id}`);
      } catch (error) {
        this.logger.error(
          `Failed to mark PDF job as timed out: jobId=${job.id}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }
  }
}
