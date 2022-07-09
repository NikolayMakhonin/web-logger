export declare type TErrorHandler = (...args: any[]) => void;
export declare function catchUnhandledErrors(errorHandler: TErrorHandler): () => void;
