import { ILogEvent, LogLevel, TAppState } from '../../common/log/contracts';
import { Logger } from '../../common/log/Logger';
declare type HandlersNames = 'writeToConsole' | 'writeToFile' | 'sendLog' | 'emitEvent';
export declare class LoggerNode extends Logger<HandlersNames> {
    init({ appName, appVersion, logDir, logFileName, logUrls, writeToConsoleLevels, writeToFileLevels, sendLogLevels, emitEventLevels, filter, appState, interceptEval, }: {
        appName: string;
        appVersion: string;
        logDir?: string;
        logFileName: string;
        logUrls?: string[];
        writeToConsoleLevels?: LogLevel;
        writeToFileLevels?: LogLevel;
        sendLogLevels?: LogLevel;
        emitEventLevels?: LogLevel;
        filter?: (logEvent: ILogEvent<HandlersNames>) => boolean;
        appState?: TAppState;
        /** Use this only with strict mode */
        interceptEval?: false;
    }): void;
}
export declare const logger: LoggerNode;
export {};
