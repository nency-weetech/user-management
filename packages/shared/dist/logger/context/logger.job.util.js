"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runWithJobContext = runWithJobContext;
const crypto_1 = require("crypto");
const logger_context_1 = require("../logger.context");
async function runWithJobContext(options, fn) {
    const context = {
        type: 'job',
        jobId: options.jobId || (0, crypto_1.randomUUID)(),
        jobName: options.jobName,
        queueName: options.queueName,
        attempt: options.attempt,
    };
    return logger_context_1.LoggerContext.run(context, async () => fn());
}
//# sourceMappingURL=logger.job.util.js.map