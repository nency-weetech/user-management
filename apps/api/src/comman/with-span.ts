
import {
  trace,
  SpanStatusCode,
  type Span,
} from '@opentelemetry/api';

const tracer = trace.getTracer('user-management-api');

export async function measure<T>(
  name: string,
  callback: (span: Span) => Promise<T>,
): Promise<T> {
  return tracer.startActiveSpan(name, async (span) => {
    try {
      return await callback(span);
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
      });

      if (error instanceof Error) {
        span.recordException(error);
      }

      throw error;
    } finally {
      span.end();
    }
  });
}