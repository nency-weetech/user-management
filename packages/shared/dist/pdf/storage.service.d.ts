import { OnModuleInit } from "@nestjs/common";
export declare class StorageService implements OnModuleInit {
    private readonly bucket;
    private readonly region;
    private readonly base;
    private readonly internal;
    private readonly publicClient;
    onModuleInit(): Promise<void>;
    upload(key: string, buffer: Buffer): Promise<void>;
    exists(key: string): Promise<Boolean>;
    presignGet(key: string, expirySecond?: number, filename?: string): Promise<string>;
    remove(key: string): Promise<void>;
}
//# sourceMappingURL=storage.service.d.ts.map