import { AsyncLocalStorage } from "async_hooks";
import { ContextData } from "./logger.interface";

const asyncLocalStorage = new AsyncLocalStorage<ContextData>()

export class LoggerContext {
    static run<T>(context : ContextData, callback : () => T): T{
        return asyncLocalStorage.run(context, callback)
    }
    static get(): ContextData | undefined {
        return asyncLocalStorage.getStore()
    }
    static set(partial: Partial<ContextData>) : void {
        const store = asyncLocalStorage.getStore()
        if(store){
            Object.assign(store, partial)
        }
    }
}