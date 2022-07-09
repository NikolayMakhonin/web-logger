import { ILogEvent, ILogger, LogLevel } from './contracts';
import { LogHandler } from './LogHandler';
export declare class EmitEventHandler extends LogHandler<'emitEvent'> {
    constructor(logger: ILogger<any>, allowLogLevels: LogLevel);
    protected handleLog(logEvents: Array<ILogEvent<any>>): Promise<void>;
}
