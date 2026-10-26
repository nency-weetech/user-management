import { KafkaMessage } from 'kafkajs';
export declare class PoisonMessageError extends Error {
    readonly isPoison = true;
    constructor(message: string);
}
export declare const isPoison: (e: unknown) => boolean;
export interface ChatMessageEvent {
    messageId: string;
    roomId: string;
    senderId: string;
    content: string | null;
    fileKey: string | null;
    fileName: string | null;
    fileType: string | null;
    createdAt: string | null;
}
export declare function parseChatEvent(message: KafkaMessage): ChatMessageEvent;
//# sourceMappingURL=parse-chat-event.d.ts.map