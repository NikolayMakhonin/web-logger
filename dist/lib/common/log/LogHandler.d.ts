import { ActionMode, ILogEvent, ILogEventParams, ILogger, ILogHandler, LogLevel } from './contracts';
export declare function canDoAction(actionMode: ActionMode, allowedLevels: LogLevel, level: LogLevel): boolean;
export declare abstract class LogHandler<Name extends string | number> implements ILogHandler<Name> {
    private readonly _queue;
    private _inProcess;
    private readonly _maxLogSize;
    protected readonly _logger: ILogger<Name>;
    allowLogLevels: LogLevel;
    name: Name;
    disabled: boolean;
    protected constructor({ name, logger, allowLogLevels, maxLogSize, }: {
        name: Name;
        logger: ILogger<Name>;
        allowLogLevels?: LogLevel;
        maxLogSize?: number;
    });
    init(): void;
    private canLog;
    private onError;
    protected abstract handleLog(logEvents: Array<ILogEvent<Name>>): void | Promise<void>;
    enqueueLog(logEvent: ILogEvent<Name>): void;
    private handleLogs;
}
export declare function handleLogErrorHandler<HandlersNames extends string | number>(logEvents: Array<ILogEventParams<HandlersNames>>, error: Error, logger: ILogger<HandlersNames>, changeNewLogEvent: (newLogEvent: ILogEventParams<HandlersNames>) => void): void;
