import { CombineLogHandlers } from '../../common/log/CombineLogHandlers.mjs';
import { LogLevel } from '../../common/log/contracts.mjs';
import { EmitEventHandler } from '../../common/log/EmitEventHandler.mjs';
import { catchUnhandledErrors } from '../../common/log/intercept/catchUnhandledErrors.mjs';
import { Logger } from '../../common/log/Logger.mjs';
import { WriteToConsoleHandler } from '../../common/log/WriteToConsoleHandler.mjs';
import { SendLogHandlerBrowser } from './SendLogHandlerBrowser.mjs';
import { SendToRemoteHandler } from './SendToRemoteHandler.mjs';
import { globalScope } from '../../common/log/globalScope.mjs';
import 'tslib';
import '../../common/log/LogHandler.mjs';
import '../../common/log/intercept/InstrumentedPromise.mjs';
import '../../common/helpers/isNode.mjs';
import '../../common/log/LogEvent.mjs';
import '../../common/log/helpers.mjs';
import '../../common/log/spark-md5.cjs';
import '../../common/log/objectToString.mjs';
import '../../common/log/intercept/interceptEval.mjs';
import '../../common/log/intercept/interceptConsole.mjs';
import '../../common/log/SendLogHandler.mjs';
import '../../common/log/delay.mjs';

class LoggerBrowser extends Logger {
    init({ appName, appVersion, logUrls, logFileName, sendToRemoteLevels = LogLevel.Any, writeToConsoleLevels = LogLevel.Any, sendLogLevels = LogLevel.Fatal | LogLevel.Error | LogLevel.Warning | LogLevel.UserError | LogLevel.UserWarning, emitEventLevels = LogLevel.Any, filter, appState, interceptEval, }) {
        const { unsubscribeUnhandledErrors } = globalScope;
        if (typeof unsubscribeUnhandledErrors === 'function') {
            globalScope.unsubscribeUnhandledErrors = null;
            unsubscribeUnhandledErrors();
        }
        catchUnhandledErrors((...args) => {
            this.error(...args);
        });
        super._init({
            appName,
            appVersion,
            handlers: [
                new WriteToConsoleHandler(this, writeToConsoleLevels),
                logUrls && logUrls.length && new CombineLogHandlers(this, ...logUrls.map(logUrl => new SendLogHandlerBrowser(this, sendLogLevels, logUrl))),
                new EmitEventHandler(this, emitEventLevels),
                new SendToRemoteHandler(this, sendToRemoteLevels, logFileName),
            ],
            filter,
            appState,
        });
    }
}
const logger = new LoggerBrowser();

export { LoggerBrowser, logger };
