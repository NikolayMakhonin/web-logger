import { ILogEvent, ILogger, LogLevel } from './contracts';
import { LogHandler } from './LogHandler';
export declare class WriteToConsoleHandler extends LogHandler<'writeToConsole'> {
    constructor(logger: ILogger<any>, allowLogLevels: LogLevel);
    init(): void;
    private interceptConsole;
    protected handleLog(logEvents: Array<ILogEvent<any>>): void | Promise<void>;
}
