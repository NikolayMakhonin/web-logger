import { ILogEvent, LogLevel, TAppState } from '../../common/log/contracts';
import { Logger } from '../../common/log/Logger';
declare type HandlersNames = 'writeToConsole' | 'sendToRemote' | 'sendLog' | 'emitEvent';
export declare class LoggerBrowser extends Logger<HandlersNames> {
    init({ appName, appVersion, logUrls, logFileName, sendToRemoteLevels, writeToConsoleLevels, sendLogLevels, emitEventLevels, filter, appState, interceptEval, }: {
        appName: string;
        appVersion: string;
        logUrls: string[];
        logFileName: string;
        sendToRemoteLevels?: LogLevel;
        writeToConsoleLevels?: LogLevel;
        sendLogLevels?: LogLevel;
        emitEventLevels?: LogLevel;
        filter?: (logEvent: ILogEvent<HandlersNames>) => boolean;
        appState?: TAppState;
        /** Use this only with strict mode */
        interceptEval?: false;
    }): void;
}
export declare const logger: LoggerBrowser;
export {};
