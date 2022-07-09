import { ILogEvent, ILogEventParams, ILogger, ILogHandler, ILogHandlers, ISubscriber, IUnsubscribe, LogLevel, TAppState } from './contracts';
import { TLogMessage } from './LogEvent';
export declare class Logger<HandlersNames extends string | number> implements ILogger<HandlersNames> {
    handlers: ILogHandlers<HandlersNames>;
    minTimeBetweenEqualEvents: number;
    filter: (logEvent: ILogEvent<HandlersNames>) => boolean;
    private readonly _logEventsTime;
    appName: string;
    appVersion: string;
    appState: TAppState;
    private _initialized;
    protected _init({ appName, appVersion, handlers, filter, appState, interceptEval: _interceptEval, }: {
        appName: string;
        appVersion: string;
        handlers: Array<ILogHandler<HandlersNames>>;
        filter?: (logEvent: ILogEvent<HandlersNames>) => boolean;
        appState?: TAppState;
        /** Use this only with strict mode */
        interceptEval?: false;
    }): void;
    debug(...messagesOrErrors: TLogMessage[]): void;
    info(...messagesOrErrors: TLogMessage[]): void;
    action(...messagesOrErrors: TLogMessage[]): void;
    warn(...messagesOrErrors: TLogMessage[]): void;
    error(...messagesOrErrors: TLogMessage[]): void;
    log(level: LogLevel, ...messagesOrErrors: TLogMessage[]): any;
    log(logEvent: ILogEventParams<HandlersNames>): any;
    private createLogEvent;
    private _log;
    private readonly _subscribers;
    subscribe(subscriber: ISubscriber<HandlersNames>): IUnsubscribe;
    onLog(logEvent: ILogEvent<HandlersNames>): Promise<void>;
}
