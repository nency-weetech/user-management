"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withTimeout = withTimeout;
async function withTimeout(p, ms, lable) {
    let timer;
    try {
        return await Promise.race([
            p,
            new Promise((_, reject) => {
                timer = setTimeout(() => reject(new Error(`${lable} Timeout after ${ms}ms`)), ms);
            }),
        ]);
    }
    finally {
        clearTimeout(timer);
    }
}
//# sourceMappingURL=with-timeout.js.map