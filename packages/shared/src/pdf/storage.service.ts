import { Injectable, OnModuleInit } from "@nestjs/common";
import * as Minio from 'minio';

@Injectable()
export class StorageService implements OnModuleInit{
    private readonly bucket = process.env.PDF_BUCKET;
    private readonly region = 'us-east-01';

    private readonly base = {
        endPoint : process.env.MINIO_HOST ?? 'localhost',
        port : Number(process.env.MINIO_PORT ?? 9000),
        useSSL: false,
        accessKey : process.env.MINIO_ACCESS_KEY!,
        secretKey : process.env.MINIO_SECRET_KEY!,
    };

    private readonly internal = new Minio.Client(this.base);

    private readonly publicClient = new Minio.Client({
        ...this.base,
        endPoint: process.env.MINIO_PUBLIC_HOST ?? this.base.endPoint,
        port : Number(process.env.MINIO_PUBLIC_PORT ?? this.base.port),
        region: this.region
    })

    async onModuleInit() {
        if(!(await this.internal.bucketExists(this.bucket))){
            await this.internal.makeBucket(this.bucket, this.region);
        }
    }
    async upload(key : string, buffer: Buffer){
        await this.internal.putObject(this.bucket, key, buffer, buffer.length, {
            'Content-Type': 'application/pdf'
        })
    }
    async exists(key: string): Promise<Boolean>{
        try {
            await this.internal.statObject(this.bucket, key)
            return true;
        } catch (error) {
            return false;
        }
    }

    async presignGet(key: string, expirySecond = 60, filename = 'invoice.pdf'){
        return this.publicClient.presignedGetObject(this.bucket, key, expirySecond, {
            'response-content-disposition' : `attachment; filename=${filename}`,
            'response-content-type': 'application/pdf'
        })
    }

    async remove(key : string){
        await this.internal.removeObject(this.bucket, key)
    }
}