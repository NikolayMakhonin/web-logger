import { ILogEvent, ILogger, LogLevel } from '../../common/log/contracts';
import { LogHandler } from '../../common/log/LogHandler';
export declare class SendToRemoteHandler extends LogHandler<'sendToRemote'> {
    constructor(logger: ILogger<any>, allowLogLevels: LogLevel, logFileName: string);
    private _logFileName;
    get logFileName(): string;
    set logFileName(value: string);
    protected handleLog(logEvents: Array<ILogEvent<any>>): Promise<void>;
}
