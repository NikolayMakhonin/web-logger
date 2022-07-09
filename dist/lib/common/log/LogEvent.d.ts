import { ILogEvent, ILogEventParams, ILogHandlersModes, LogLevel, TAppState } from './contracts';
export declare type TLogMessage = any | Error;
export declare type TLogMessageOrArray = TLogMessage | TLogMessage[];
export declare class LogEvent<HandlersNames extends string | number> implements ILogEvent<HandlersNames> {
    readonly level: LogLevel;
    readonly messagesOrErrors: TLogMessageOrArray;
    readonly handlersModes: ILogHandlersModes<HandlersNames>;
    readonly time: Date;
    readonly stack: string;
    readonly additionalHashString: string;
    readonly appState: TAppState;
    constructor({ level, messagesOrErrors, handlersModes, time, stack, additionalHashString, appState, }: {
        appState?: TAppState;
    } & ILogEventParams<HandlersNames>);
    private _messages;
    get messages(): string[];
    private _messagesString;
    get messagesString(): string;
    private _errors;
    get errors(): Error[];
    private _errorsString;
    get errorsString(): string;
    get consoleLevel(): "error" | "debug" | "info" | "log" | "warn";
    private _consoleString;
    get consoleString(): string;
    private _timeString;
    get dateString(): string;
    private _stackString;
    get stackString(): string;
    private _appInfo;
    get appInfo(): string;
    private _md5Hash;
    get md5Hash(): string;
    private _bodyString;
    get bodyString(): string;
}
