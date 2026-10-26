import { KafkaMessage } from 'kafkajs';
export interface ParsedEvent {
    eventId: string;
    eventType: string | null;
    aggregateId: string | null;
    payload: Record<string, unknown>;
}
export declare class PoissionMessageError extends Error {
}
export declare function ParsedEvent(topic: string, partition: number, message: KafkaMessage): {
    eventId: string;
    eventType: string;
    aggregateId: string;
    payload: Record<string, unknown>;
};
//# sourceMappingURL=parse-event.d.ts.map