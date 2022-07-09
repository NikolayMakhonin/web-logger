import { TLogMessageOrArray } from "./LogEvent";
export declare enum LogLevel {
    Trace = 1,
    Debug = 2,
    Info = 4,
    UserAction = 8,
    Action = 16,
    UserWarning = 32,
    UserError = 64,
    Warning = 128,
    Error = 256,
    Fatal = 512,
    None = 0,
    Any = 1023
}
export declare enum ActionMode {
    Default = 0,
    Always = 1,
    Never = 2
}
export declare type ILogHandlersModes<Name extends string | number> = {
    [key in (Name | '_all')]?: ActionMode;
};
export interface ILogEventParams<HandlersNames extends string | number> {
    level: LogLevel;
    messagesOrErrors: TLogMessageOrArray;
    handlersModes?: ILogHandlersModes<HandlersNames>;
    time?: Date;
    stack?: string;
    additionalHashString?: string;
}
export interface ILogEvent<HandlersNames extends string | number> extends ILogEventParams<HandlersNames> {
    readonly messages: string[];
    readonly messagesString: string;
    readonly errors: Error[];
    readonly errorsString: string;
    readonly consoleLevel: string;
    readonly consoleString: string;
    readonly dateString: string;
    readonly stackString: string;
    readonly appInfo: string;
    readonly md5Hash: string;
    readonly bodyString: string;
}
export interface ILogHandler<Name extends string | number> {
    name: Name;
    disabled: boolean;
    allowLogLevels: LogLevel;
    init(): any;
    enqueueLog(logEvent: ILogEvent<Name>): void;
}
export declare type ILogHandlers<HandlersNames extends string | number> = {
    [key in HandlersNames]: ILogHandler<HandlersNames>;
};
export declare type ISubscriber<HandlersNames extends string | number> = (logEvent: ILogEvent<HandlersNames>) => void | Promise<void>;
export declare type IUnsubscribe = () => void;
export interface ILogger<HandlersNames extends string | number> {
    appName: string;
    appVersion: string;
    handlers: ILogHandlers<HandlersNames>;
    error(error: Error): any;
    log(level: LogLevel, message: string, error?: Error): any;
    log(logEvent: ILogEventParams<HandlersNames>): any;
    subscribe(subscriber: ISubscriber<HandlersNames>): IUnsubscribe;
    onLog(logEvent: ILogEventParams<HandlersNames>): any;
}
export declare type TAppState = {
    [key: string]: any;
};
