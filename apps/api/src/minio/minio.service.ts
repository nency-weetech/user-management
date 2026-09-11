import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import { Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class MinioService {
  private readonly minioClient: Client;
  private readonly bucketName: string;
  private readonly logger = new Logger(MinioService.name);

  constructor(private configService: ConfigService) {
    this.minioClient = new Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT'),
      port: this.configService.get<number>('MINIO_PORT', 9000),
      useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY'),
    });
    this.bucketName = this.configService.get<string>('MINIO_BUCKET');
  }

  async onModuleInit(): Promise<void> {
    await this.initializeBucket();
  }
  private async initializeBucket(): Promise<void> {
    const exist = await this.minioClient.bucketExists(this.bucketName);

    if (!exist) {
      await this.minioClient.makeBucket(this.bucketName);
      this.logger.log(`MinIO bucket "${this.bucketName}" created successfully`);

      return;
    }

    this.logger.log(`MinIO bucket "${this.bucketName}" already  created`);
  }

  async generateFileKey(roomId: string, originalFileName: string){
    const uniqueId = randomUUID();
    const safeName = originalFileName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    return `rooms/${roomId}/${uniqueId}-${safeName}`;
  }

  async getUplaodUrl(fileKey: string): Promise<String>{
    const expirySecond = 5 * 60 ;
    return this.minioClient.presignedPutObject(this.bucketName, fileKey, expirySecond)
  }

  async getDownloadUrl(fileKey: string): Promise<string>{
    const expirySecond = 5 * 60;
    return this.minioClient.presignedGetObject(this.bucketName, fileKey, expirySecond);
  }

  // async uploadFile(
  //   file: Express.Multer.File,
  //   objectName: string,
  // ): Promise<void> {
  //   this.minioClient.putObject(
  //     this.bucketName,
  //     objectName,
  //     file.buffer,
  //     file.size,
  //     {
  //       'Content-Type': file.mimetype
  //     }
  //   );
  // }
}
