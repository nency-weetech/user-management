"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerContext = void 0;
const async_hooks_1 = require("async_hooks");
const asyncLocalStorage = new async_hooks_1.AsyncLocalStorage();
class LoggerContext {
    static run(context, callback) {
        return asyncLocalStorage.run(context, callback);
    }
    static get() {
        return asyncLocalStorage.getStore();
    }
    static set(partial) {
        const store = asyncLocalStorage.getStore();
        if (store) {
            Object.assign(store, partial);
        }
    }
}
exports.LoggerContext = LoggerContext;
//# sourceMappingURL=logger.context.js.map