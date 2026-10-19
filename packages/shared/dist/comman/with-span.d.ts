import { type Span } from '@opentelemetry/api';
export declare function measure<T>(name: string, callback: (span: Span) => Promise<T>): Promise<T>;
//# sourceMappingURL=with-span.d.ts.map