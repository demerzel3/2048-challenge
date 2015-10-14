export class Deferred<T> {
    public promise:Promise<T>;
    public resolve:<U>(value:T) => U;
    public reject:<U>(error:any) => U;

    constructor() {
        this.promise = new Promise<T>((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}