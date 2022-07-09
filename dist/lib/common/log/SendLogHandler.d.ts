import { ILogEvent, ILogger, LogLevel } from './contracts';
import { LogHandler } from './LogHandler';
export interface ISendLogMessage {
    Token: string;
    Hash: string;
    AppName: string;
    AppVersion: string;
    /** ISO */
    Time: string;
    /** LogLevel name */
    Type: string;
    MessageShort: string;
    MessageFull: string;
}
export declare abstract class SendLogHandler extends LogHandler<'sendLog'> {
    logUrl: string;
    constructor(logger: ILogger<any>, allowLogLevels: LogLevel, logUrl: string);
    protected abstract sendLog(logUrl: string, message: ISendLogMessage, selfError?: (...messagesOrErrors: any[]) => void): Promise<{
        statusCode: number;
    }>;
    protected handleLog(logEvents: Array<ILogEvent<any>>): Promise<void>;
}
