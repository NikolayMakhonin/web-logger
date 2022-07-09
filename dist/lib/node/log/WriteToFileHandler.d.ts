import { ILogEvent, ILogger, LogLevel } from '../../common/log/contracts';
import { LogHandler } from '../../common/log/LogHandler';
export declare class WriteToFileHandler extends LogHandler<'writeToFile'> {
    logDir: string;
    logFileName: string;
    constructor(logger: ILogger<any>, allowLogLevels: LogLevel, logDir: string, logFileName: string);
    get logFilePath(): string;
    protected handleLog(logEvents: Array<ILogEvent<any>>): Promise<void>;
}
