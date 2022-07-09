import { SendLogHandler } from '../../common/log/SendLogHandler';
export declare class SendLogHandlerBrowser extends SendLogHandler {
    protected sendLog(...args: any[]): Promise<{
        statusCode: number;
    }>;
}
