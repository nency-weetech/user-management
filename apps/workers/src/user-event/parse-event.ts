import { KafkaMessage } from 'kafkajs';

export interface ParsedEvent {
  eventId: string;
  eventType: string | null;
  aggregateId: string | null;
  payload: Record<string, unknown>;
}

export class PoissionMessageError extends Error {}

const headerstr = (m: KafkaMessage, name: string): string | null =>
  m.headers?.[name]?.toString() ?? null;

export function ParsedEvent(topic : string, partition: number, message: KafkaMessage){
    if(!message.value) throw new PoissionMessageError('empty value');

    let data: unknown;
    try {
        data = JSON.parse(message.value.toString());
        if(typeof data === 'string') {
            data = JSON.parse(data)
        }
    } catch (error) {
        throw new PoissionMessageError('Invalid vlaue', error);
    }

    if(data === null || typeof data !== 'object' || Array.isArray(data)){
        throw new PoissionMessageError('Payload is not an object')
    }

    const eventId = headerstr(message, 'id') ?? `${topic}-${partition}-${message.offset}`;
    const eventType = headerstr(message, 'eventType');
    const aggregateId = message.key?.toString() ?? null;
    const payload = data as Record<string, unknown>;

    return {
        eventId,
        eventType,
        aggregateId,
        payload
    }
}