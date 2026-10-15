import 'dotenv/config';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { SpanKind } from '@opentelemetry/api';
import { ExportResult, ExportResultCode } from '@opentelemetry/core';
import { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-base';

// class CompactExporter implements SpanExporter {
//   export(spans: ReadableSpan[], cb: (r: ExportResult) => void) {
//     for (const s of spans) {
//       const ms = s.duration[0] * 1000 + s.duration[1] / 1e6;
//       console.log(
//         `[span] trace=${s.spanContext().traceId.slice(0, 6)} ` +
//           `id=${s.spanContext().spanId.slice(0, 6)} ` +
//           `parent=${s.parentSpanContext?.spanId.slice(0, 6) ?? '-'} ` +
//           `kind=${SpanKind[s.kind]} ${s.name} ${ms.toFixed(1)}ms`,
//       );
//     }
//     cb({ code: ExportResultCode.SUCCESS });
//   }
//   shutdown() {
//     return Promise.resolve();
//   }
// }

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter(),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false },
      '@opentelemetry/instrumentation-express': {
        ignoreLayers: [/patched/],
      },
    }),
  ],
});

sdk.start();
process.on('SIGTERM', () => {
  sdk.shutdown().finally(() => process.exit(0));
});

