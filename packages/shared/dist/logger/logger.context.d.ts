import { ContextData } from "./logger.interface";
export declare class LoggerContext {
    static run<T>(context: ContextData, callback: () => T): T;
    static get(): ContextData | undefined;
    static set(partial: Partial<ContextData>): void;
}
//# sourceMappingURL=logger.context.d.ts.map