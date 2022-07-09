import { TConsoleHandlerFactory, TConsoleLevel } from './intercept/interceptConsole';
export declare function subscribeUnhandledErrors({ catchUnhandled, catchEval, catchConsoleLevels, filterEval, alert: _alert, maxLogLength, customLog, }?: {
    catchUnhandled?: boolean | ((...args: any[]) => boolean | void);
    catchEval?: boolean | ((...args: any[]) => boolean | void);
    catchConsoleLevels?: TConsoleLevel[] | TConsoleHandlerFactory;
    filterEval?: (str: string) => boolean;
    alert?: boolean;
    maxLogLength?: number;
    customLog?: (log: string) => boolean | void;
}): () => void;
