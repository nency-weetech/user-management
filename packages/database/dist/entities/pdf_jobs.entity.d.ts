export declare enum PdfJobStatus {
    QUEUED = "queued",
    PROCESSING = "processing",
    READY = "ready",
    FAILED = "failed",
    EXPIRED = "expired"
}
export declare class PdfJob {
    id: string;
    owner_id: string;
    status: PdfJobStatus;
    object_key: string | null;
    filename: string | null;
    error: string | null;
    expires_at: Date | null;
    created_at: Date;
    updated_at: Date;
}
