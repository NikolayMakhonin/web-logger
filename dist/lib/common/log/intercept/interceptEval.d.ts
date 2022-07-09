export declare type TEvalHandler = (str: string, evalOrig: (str: string) => any) => boolean | void;
export declare function interceptEval(handler: TEvalHandler): () => void;
export declare function catchEvalErrors(errorHandler: (...args: any[]) => void, filter?: (str: string) => boolean): () => void;
