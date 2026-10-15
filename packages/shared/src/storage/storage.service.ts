import { Injectable, Logger } from '@nestjs/common';
import * as Minio from 'minio';

const REGION = process.env.MINIO_REGION ?? 'us-east-1';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly internal: Minio.Client;
  private readonly publicClient: Minio.Client;

  constructor() {
    const endPoint = process.env.MINIO_HOST ?? 'localhost';
    const port = Number(process.env.MINIO_PORT ?? 9000);
    const useSSL = false;
    const accessKey = process.env.MINIO_ACCESS_KEY!;
    const secretKey = process.env.MINIO_SECRET_KEY!;

    this.internal = new Minio.Client({
      endPoint,
      port,
      useSSL,
      accessKey,
      secretKey,
      region: REGION,
    });
    this.publicClient = new Minio.Client({
      endPoint:
        process.env.MINIO_PUBLIC_HOST ??
        endPoint,
      port: Number(process.env.MINIO_PUBLIC_PORT ?? port),
      useSSL: (process.env.MINIO_PUBLIC_USE_SSL ?? String(useSSL)) === 'true',
      accessKey,
      secretKey,
      region: REGION,
    });
  }

  async ensureBucket(bucket: string): Promise<void>{
    if(await this.internal.bucketExists(bucket)) return;

    try {
        await this.internal.makeBucket(bucket, REGION);
        this.logger.log(`Bucket ${bucket} created`)
    } catch (err : any) {
        if (err?.code !== 'BucketAlreadyOwnedByYou' && err?.code !== 'BucketAlreadyExists') throw err;
    }
  }

  async upload(bucket: string, key: string, body: Buffer, contentType: 'application/octen-stream'){
    return this.internal.putObject(bucket, key, body, body.length, {'Content-Type': contentType})
  }

  async exist(bucket: string, key: string) : Promise<boolean>{
    try {
        await this.internal.statObject(bucket, key);
        return true
    } catch (err) {
        if (err?.code === 'NotFound' || err?.code === 'NoSuchKey') return false;
      throw err;
    }
  }

  presignGet(
    bucket: string,
    key: string,
    expiresSecond = 60,
    opts: {filename?: string, contentType?: string} = {}
  ): Promise<string>{
    const headers: Record<string, string> = {};
    if(opts.filename){
        const safe = opts.filename.replace(/["\\\r\n]/g, '_');
        headers['response-content-disposition'] = `attachment; filename="${safe}"`;
    }
    if(opts.contentType){
        headers['response-content-type'] = opts.contentType
    }

    return this.publicClient.presignedGetObject(bucket, key, expiresSecond, headers);
  }

  presignPut(bucket: string, key: string, expiresSecond=300): Promise<string>{
    return this.publicClient.presignedPutObject(bucket, key, expiresSecond);
  }

  async remove(bucket: string, key: string): Promise<void>{
    await this.internal.removeObject(bucket, key)
  }

}
