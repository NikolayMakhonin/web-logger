import { ILogEvent, ILogger, ILogHandler, LogLevel } from './contracts';
import { LogHandler } from './LogHandler';
export declare class CombineLogHandlers<Name extends string | number> implements ILogHandler<Name> {
    logHandlers: Array<LogHandler<Name>>;
    name: Name;
    allowLogLevels: LogLevel;
    disabled: boolean;
    constructor(logger: ILogger<any>, ...logHandlers: Array<LogHandler<Name>>);
    init(): void;
    enqueueLog(logEvent: ILogEvent<Name>): void;
}
