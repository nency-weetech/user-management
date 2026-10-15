export async function withTimeout<T>(p: Promise<T>, ms: number, lable: string): Promise<T> {
    let timer: NodeJS.Timeout | undefined;
    try {
        return await Promise.race([
            p,
            new Promise<never>((_, reject)=> {
                timer = setTimeout(
                    () => reject(new Error(`${lable} Timeout after ${ms}ms`)),
                    ms, 
                );
            }),
        ])
    } finally {
        clearTimeout(timer);
    }
}