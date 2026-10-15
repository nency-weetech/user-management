import { OnModuleInit } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
export declare class PdfStorage implements OnModuleInit {
    private readonly storageService;
    private readonly bucket;
    constructor(storageService: StorageService);
    onModuleInit(): Promise<void>;
    upload(key: string, pdf: Buffer): Promise<import("minio/dist/main/internal/type.js").UploadedObjectInfo>;
    exists(key: string): Promise<boolean>;
    presignGet(key: string, expirySecond?: number, filename?: string): Promise<string>;
    remove(key: string): Promise<void>;
}
//# sourceMappingURL=pdf.storage.service.d.ts.map