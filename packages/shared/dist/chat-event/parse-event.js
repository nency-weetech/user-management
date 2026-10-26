"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoissionMessageError = void 0;
exports.ParsedEvent = ParsedEvent;
class PoissionMessageError extends Error {
}
exports.PoissionMessageError = PoissionMessageError;
const headerstr = (m, name) => m.headers?.[name]?.toString() ?? null;
function ParsedEvent(topic, partition, message) {
    if (!message.value)
        throw new PoissionMessageError('empty value');
    let data;
    try {
        data = JSON.parse(message.value.toString());
        if (typeof data === 'string') {
            data = JSON.parse(data);
        }
    }
    catch (error) {
        throw new PoissionMessageError('Invalid vlaue', error);
    }
    if (data === null || typeof data !== 'object' || Array.isArray(data)) {
        throw new PoissionMessageError('Payload is not an object');
    }
    const eventId = headerstr(message, 'id') ?? `${topic}-${partition}-${message.offset}`;
    const eventType = headerstr(message, 'eventType');
    const aggregateId = message.key?.toString() ?? null;
    const payload = data;
    return {
        eventId,
        eventType,
        aggregateId,
        payload
    };
}
//# sourceMappingURL=parse-event.js.map