import { CombineLogHandlers } from '../../common/log/CombineLogHandlers.mjs';
import { LogLevel } from '../../common/log/contracts.mjs';
import { EmitEventHandler } from '../../common/log/EmitEventHandler.mjs';
import { Logger } from '../../common/log/Logger.mjs';
import { catchUnhandledErrors } from '../../common/log/intercept/catchUnhandledErrors.mjs';
import { WriteToConsoleHandler } from '../../common/log/WriteToConsoleHandler.mjs';
import { SendLogHandlerNode } from './SendLogHandlerNode.mjs';
import { WriteToFileHandler } from './WriteToFileHandler.mjs';
import path from 'path';
import 'tslib';
import '../../common/log/LogHandler.mjs';
import '../../common/log/LogEvent.mjs';
import '../../common/log/helpers.mjs';
import '../../common/log/spark-md5.cjs';
import '../../common/log/objectToString.mjs';
import '../../common/log/intercept/interceptEval.mjs';
import '../../common/log/globalScope.mjs';
import '../../common/log/intercept/InstrumentedPromise.mjs';
import '../../common/helpers/isNode.mjs';
import '../../common/log/intercept/interceptConsole.mjs';
import '../../common/log/SendLogHandler.mjs';
import '../../common/log/delay.mjs';
import 'needle';
import 'fs/promises';

class LoggerNode extends Logger {
    init({ appName, appVersion, logDir, logFileName = 'log.log', logUrls, writeToConsoleLevels = LogLevel.Any, writeToFileLevels = LogLevel.Fatal | LogLevel.Error | LogLevel.Warning
        | LogLevel.UserError | LogLevel.UserWarning, sendLogLevels = LogLevel.Fatal | LogLevel.Error | LogLevel.Warning | LogLevel.UserError | LogLevel.UserWarning, emitEventLevels = LogLevel.Any, filter, appState, interceptEval, }) {
        catchUnhandledErrors((...args) => {
            this.error(...args);
        });
        super._init({
            appName,
            appVersion,
            handlers: [
                new WriteToConsoleHandler(this, writeToConsoleLevels),
                logDir && new WriteToFileHandler(this, writeToFileLevels, path.resolve(logDir), logFileName),
                logUrls && logUrls.length && new CombineLogHandlers(this, ...logUrls.map(logUrl => new SendLogHandlerNode(this, sendLogLevels, logUrl))),
                new EmitEventHandler(this, emitEventLevels),
            ],
            filter,
            appState,
            interceptEval,
        });
    }
}
const logger = new LoggerNode();

export { LoggerNode, logger };
