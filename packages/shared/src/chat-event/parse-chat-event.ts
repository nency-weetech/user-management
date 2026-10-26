import { KafkaMessage } from 'kafkajs';

export class PoisonMessageError extends Error {
  readonly isPoison = true;
  constructor(message: string) {
    super(message);
    this.name = 'PoisonMessageError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
export const isPoison = (e: unknown): boolean => (e as any)?.isPoison === true;

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

// Connect ka {schema, payload} wrapper hatao
const unwrap = (v: unknown): unknown =>
  v && typeof v === 'object' && !Array.isArray(v) && 'schema' in v && 'payload' in v
    ? (v as { payload: unknown }).payload
    : v;

// wrapper aur double-encoded JSON, dono peel karo
function decode(raw: string): Record<string, unknown> {
  let v: unknown = raw;
  for (let i = 0; i < 3 && typeof v === 'string'; i++) {
    try {
      v = unwrap(JSON.parse(v));
    } catch {
      throw new PoisonMessageError('invalid JSON');
    }
  }
  if (!v || typeof v !== 'object' || Array.isArray(v)) {
    throw new PoisonMessageError('payload is not an object');
  }
  return v as Record<string, unknown>;
}

export function parseChatEvent(message: KafkaMessage): ChatMessageEvent {
  if (!message.value) throw new PoisonMessageError('empty value');

  const p = decode(message.value.toString());
  const str = (k: string): string | null =>
    typeof p[k] === 'string' && p[k] ? (p[k] as string) : null;

  const messageId = str('messageId');
  const roomId = str('roomId');
  const senderId = str('senderId');
  const content = str('content');
  const fileKey = str('fileKey');

  const missing: string[] = [];
  if (!messageId) missing.push('messageId');
  if (!roomId) missing.push('roomId');
  if (!senderId) missing.push('senderId');
  if (!content && !fileKey) missing.push('content|fileKey');
  if (missing.length) {
    throw new PoisonMessageError(
      `missing fields: ${missing.join(',')} keys=[${Object.keys(p).join(',')}]`,
    );
  }

  return {
    messageId: messageId!,
    roomId: roomId!,
    senderId: senderId!,
    content,
    fileKey,
    fileName: str('fileName'),
    fileType: str('fileType'),
    createdAt: str('createdAt'),
  };
}