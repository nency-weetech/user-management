"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPoison = exports.PoisonMessageError = void 0;
exports.parseChatEvent = parseChatEvent;
class PoisonMessageError extends Error {
    isPoison = true;
    constructor(message) {
        super(message);
        this.name = 'PoisonMessageError';
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.PoisonMessageError = PoisonMessageError;
const isPoison = (e) => e?.isPoison === true;
exports.isPoison = isPoison;
// Connect ka {schema, payload} wrapper hatao
const unwrap = (v) => v && typeof v === 'object' && !Array.isArray(v) && 'schema' in v && 'payload' in v
    ? v.payload
    : v;
// wrapper aur double-encoded JSON, dono peel karo
function decode(raw) {
    let v = raw;
    for (let i = 0; i < 3 && typeof v === 'string'; i++) {
        try {
            v = unwrap(JSON.parse(v));
        }
        catch {
            throw new PoisonMessageError('invalid JSON');
        }
    }
    if (!v || typeof v !== 'object' || Array.isArray(v)) {
        throw new PoisonMessageError('payload is not an object');
    }
    return v;
}
function parseChatEvent(message) {
    if (!message.value)
        throw new PoisonMessageError('empty value');
    const p = decode(message.value.toString());
    const str = (k) => typeof p[k] === 'string' && p[k] ? p[k] : null;
    const messageId = str('messageId');
    const roomId = str('roomId');
    const senderId = str('senderId');
    const content = str('content');
    const fileKey = str('fileKey');
    const missing = [];
    if (!messageId)
        missing.push('messageId');
    if (!roomId)
        missing.push('roomId');
    if (!senderId)
        missing.push('senderId');
    if (!content && !fileKey)
        missing.push('content|fileKey');
    if (missing.length) {
        throw new PoisonMessageError(`missing fields: ${missing.join(',')} keys=[${Object.keys(p).join(',')}]`);
    }
    return {
        messageId: messageId,
        roomId: roomId,
        senderId: senderId,
        content,
        fileKey,
        fileName: str('fileName'),
        fileType: str('fileType'),
        createdAt: str('createdAt'),
    };
}
//# sourceMappingURL=parse-chat-event.js.map