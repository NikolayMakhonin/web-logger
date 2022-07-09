export declare type TConsoleLevel = 'debug' | 'info' | 'log' | 'warn' | 'error';
export declare type TConsoleHandlerFactory = (level: TConsoleLevel, handlerOrig: (...args: any[]) => void) => ((...args: any[]) => boolean | void) | boolean | void;
export declare const CONSOLE_LEVELS: ['debug', 'info', 'log', 'warn', 'error'];
export declare const consoleOrig: {
    debug: any;
    info: any;
    log: any;
    warn: any;
    error: any;
};
export declare function interceptConsole(handlerFactory: TConsoleHandlerFactory, levels?: TConsoleLevel[]): () => void;
