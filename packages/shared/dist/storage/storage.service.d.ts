export declare class StorageService {
    private readonly logger;
    private readonly internal;
    private readonly publicClient;
    constructor();
    ensureBucket(bucket: string): Promise<void>;
    upload(bucket: string, key: string, body: Buffer, contentType: 'application/octen-stream'): Promise<import("minio/dist/main/internal/type.js").UploadedObjectInfo>;
    exist(bucket: string, key: string): Promise<boolean>;
    presignGet(bucket: string, key: string, expiresSecond?: number, opts?: {
        filename?: string;
        contentType?: string;
    }): Promise<string>;
    presignPut(bucket: string, key: string, expiresSecond?: number): Promise<string>;
    remove(bucket: string, key: string): Promise<void>;
}
//# sourceMappingURL=storage.service.d.ts.map