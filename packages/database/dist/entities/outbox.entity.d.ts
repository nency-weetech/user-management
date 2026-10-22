export declare class Outbox {
    id: string;
    aggregate_type: string;
    aggregate_id: string;
    event_type: string;
    payload: Record<string, unknown>;
    trace_id: string;
    created_at: Date;
}
