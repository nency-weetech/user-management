import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { StorageService } from '@myapp/shared'; 

@Injectable()
export class ChatStorage implements OnModuleInit {
  private readonly bucket: string;

  constructor(
    private readonly storage: StorageService,
    config: ConfigService,
  ) {
    this.bucket = config.getOrThrow<string>('CHAT_BUCKET');
  }

  onModuleInit() {
    return this.storage.ensureBucket(this.bucket);
  }

  async generateFileKey(roomId: string, originalFileName: string) {
    const safeName = originalFileName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    return `rooms/${roomId}/${randomUUID()}-${safeName}`;
  }

  async getUplaodUrl(fileKey: string): Promise<string> {
    return this.storage.presignPut(this.bucket, fileKey, 5 * 60);
  }

  async getDownloadUrl(fileKey: string): Promise<string> {
    return this.storage.presignGet(this.bucket, fileKey, 5 * 60);
  }
}