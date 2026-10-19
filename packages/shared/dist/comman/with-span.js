"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.measure = measure;
const api_1 = require("@opentelemetry/api");
const tracer = api_1.trace.getTracer('user-management-api');
async function measure(name, callback) {
    return tracer.startActiveSpan(name, async (span) => {
        try {
            return await callback(span);
        }
        catch (error) {
            span.setStatus({
                code: api_1.SpanStatusCode.ERROR,
            });
            if (error instanceof Error) {
                span.recordException(error);
            }
            throw error;
        }
        finally {
            span.end();
        }
    });
}
//# sourceMappingURL=with-span.js.map