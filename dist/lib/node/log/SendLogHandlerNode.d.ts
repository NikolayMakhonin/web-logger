import { ISendLogMessage, SendLogHandler } from '../../common/log/SendLogHandler';
export declare class SendLogHandlerNode extends SendLogHandler {
    protected sendLog(logUrl: string, message: ISendLogMessage): Promise<{
        statusCode: number;
    }>;
}
