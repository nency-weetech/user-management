import { PdfJob, PdfJobStatus } from '@myapp/database';
import { InjectQueue } from '@nestjs/bullmq';
import {
  ConflictException,
  GoneException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { In, Repository } from 'typeorm';
import { StorageService } from '@myapp/shared';

const MAX_ACTIVE_PER_OWNER = Number(process.env.PDF_MAX_ACTIVE_PER_OWNER ?? 3);

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  constructor(
    @InjectRepository(PdfJob)
    private readonly pdfjobs: Repository<PdfJob>,

    @InjectQueue('pdfQueue')
    private readonly queue: Queue,

    private readonly storageService: StorageService,
  ) {}

  async create(ownerId: string, html: string, filename?: string) {
    const active = await this.pdfjobs.count({
      where: {
        owner_id: ownerId,
        status: In([PdfJobStatus.QUEUED, PdfJobStatus.PROCESSING]),
      },
    });

    if (active >= MAX_ACTIVE_PER_OWNER) {
      this.logger.warn(
        `PDF generation limit reached for owner ${ownerId}. Active jobs: ${active}`,
      );

      throw new HttpException(
        'Too many PDFs in progress, try again shortly',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const row = await this.pdfjobs.save(
      this.pdfjobs.create({
        owner_id: ownerId,
        filename: filename ?? 'invoice.pdf',
        status: PdfJobStatus.QUEUED,
      }),
    );

    try {
      await this.queue.add(
        'render',
        {
          jobId: row.id,
          html,
        },
        {
          jobId: row.id,
          attempts: 2,
          backoff: {
            type: 'fixed',
            delay: 2000,
          },
          removeOnComplete: {
            age: 3600,
          },
          removeOnFail: {
            age: 86400,
          },
        },
      );

      this.logger.log(
        `PDF job queued successfully: jobId=${row.id}, ownerId=${ownerId}, filename=${row.filename}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to enqueue PDF job: jobId=${row.id}, ownerId=${ownerId}`,
        error instanceof Error ? error.stack : String(error),
      );

      await this.pdfjobs.update(row.id, {
        status: PdfJobStatus.FAILED,
        error: 'Could not enqueue',
      });

      throw error;
    }

    return {
      jobId: row.id,
      status: row.status,
    };
  }

  async getStatus(ownerId: string, id: string) {
    const row = await this.pdfjobs.findOne({
      where: {
        id,
        owner_id: ownerId,
      },
    });

    if (!row) {
      this.logger.warn(
        `PDF job not found: jobId=${id}, ownerId=${ownerId}`,
      );

      throw new NotFoundException();
    }

    const expired =
      row.status === PdfJobStatus.READY &&
      !!row.expires_at &&
      row.expires_at.getTime() <= Date.now();

    if (expired) {
      this.logger.debug(`PDF job expired: jobId=${id}`);
    }

    return {
      id: row.id,
      status: expired ? PdfJobStatus.EXPIRED : row.status,
      filename: row.filename,
      error: row.status === PdfJobStatus.FAILED ? row.error : null,
      expiresAt: row.expires_at,
    };
  }

  async getDownload(ownerId: string, jobId: string) {
    const row = await this.pdfjobs.findOne({
      where: {
        id: jobId,
        owner_id: ownerId,
      },
    });

    if (!row) {
      this.logger.warn(
        `PDF download requested for unknown job: jobId=${jobId}, ownerId=${ownerId}`,
      );

      throw new NotFoundException();
    }

    switch (row.status) {
      case PdfJobStatus.QUEUED:
      case PdfJobStatus.PROCESSING:
        throw new ConflictException('PDF is still being generated');

      case PdfJobStatus.FAILED:
        throw new ConflictException('PDF generation failed');

      case PdfJobStatus.EXPIRED:
        throw new GoneException('PDF has expired');
    }

    const secondsLeft = row.expires_at
      ? Math.floor((row.expires_at.getTime() - Date.now()) / 1000)
      : 0;

    if (secondsLeft <= 0 || !row.object_key) {
      this.logger.debug(
        `PDF no longer available: jobId=${jobId}`,
      );

      throw new GoneException('PDF has expired');
    }

    if (!(await this.storageService.exists(row.object_key))) {
      this.logger.warn(
        `PDF object missing from storage: jobId=${jobId}, objectKey=${row.object_key}`,
      );

      throw new GoneException('PDF is no longer available');
    }

    const ttl = Number(
      process.env.PDF_DOWNLOAD_URL_TTL_SECONDS ?? 60,
    );

    const expiresIn = Math.max(
      1,
      Math.min(ttl, secondsLeft),
    );

    const url = await this.storageService.presignGet(
      row.object_key,
      expiresIn,
      this.safeFilename(row.filename),
    );

    this.logger.log(
      `PDF download URL generated: jobId=${jobId}, expiresIn=${expiresIn}s`,
    );

    return {
      url,
      expiresIn,
    };
  }

  private safeFilename(filename: string | null): string {
    const base = (filename ?? 'invoice.pdf')
      .replace(/[^\w\-. ]/g, '_')
      .slice(0, 64);

    return base.toLowerCase().endsWith('.pdf')
      ? base
      : `${base}.pdf`;
  }
}