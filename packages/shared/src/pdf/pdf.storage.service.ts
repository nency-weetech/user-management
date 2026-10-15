import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class PdfStorage implements OnModuleInit {
  private readonly bucket = process.env.PDF_BUCKET;
  constructor(private readonly storageService: StorageService) {
    const bucket = process.env.PDF_BUCKET;
    if (!bucket) throw new Error('PDF_BUCKET is not set');
    this.bucket = bucket;
  }

  async onModuleInit() {
    return this.storageService.ensureBucket(this.bucket);
  }
  upload(key: string, pdf: Buffer) {
    return this.storageService.upload(
      this.bucket,
      key,
      pdf,
      'application/octen-stream',
    );
  }
  async exists(key: string) {
    return this.storageService.exist(this.bucket, key);
  }

  async presignGet(key: string, expirySecond = 60, filename = 'invoice.pdf') {
    return this.storageService.presignGet(this.bucket, key, expirySecond, {
        filename,
        contentType: 'application/pdf'
    });
  }

  async remove(key: string) {
    await this.storageService.remove(this.bucket, key);
  }
}
