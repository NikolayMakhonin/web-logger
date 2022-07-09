'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var common_log_CombineLogHandlers = require('../../common/log/CombineLogHandlers.cjs');
var common_log_contracts = require('../../common/log/contracts.cjs');
var common_log_EmitEventHandler = require('../../common/log/EmitEventHandler.cjs');
var common_log_intercept_catchUnhandledErrors = require('../../common/log/intercept/catchUnhandledErrors.cjs');
var common_log_Logger = require('../../common/log/Logger.cjs');
var common_log_WriteToConsoleHandler = require('../../common/log/WriteToConsoleHandler.cjs');
var browser_log_SendLogHandlerBrowser = require('./SendLogHandlerBrowser.cjs');
var browser_log_SendToRemoteHandler = require('./SendToRemoteHandler.cjs');
var common_log_globalScope = require('../../common/log/globalScope.cjs');
require('tslib');
require('../../common/log/LogHandler.cjs');
require('../../common/log/intercept/InstrumentedPromise.cjs');
require('../../common/helpers/isNode.cjs');
require('../../common/log/LogEvent.cjs');
require('../../common/log/helpers.cjs');
require('../../common/log/spark-md5.cjs');
require('../../common/log/objectToString.cjs');
require('../../common/log/intercept/interceptEval.cjs');
require('../../common/log/intercept/interceptConsole.cjs');
require('../../common/log/SendLogHandler.cjs');
require('../../common/log/delay.cjs');

class LoggerBrowser extends common_log_Logger.Logger {
    init({ appName, appVersion, logUrls, logFileName, sendToRemoteLevels = common_log_contracts.LogLevel.Any, writeToConsoleLevels = common_log_contracts.LogLevel.Any, sendLogLevels = common_log_contracts.LogLevel.Fatal | common_log_contracts.LogLevel.Error | common_log_contracts.LogLevel.Warning | common_log_contracts.LogLevel.UserError | common_log_contracts.LogLevel.UserWarning, emitEventLevels = common_log_contracts.LogLevel.Any, filter, appState, interceptEval, }) {
        const { unsubscribeUnhandledErrors } = common_log_globalScope.globalScope;
        if (typeof unsubscribeUnhandledErrors === 'function') {
            common_log_globalScope.globalScope.unsubscribeUnhandledErrors = null;
            unsubscribeUnhandledErrors();
        }
        common_log_intercept_catchUnhandledErrors.catchUnhandledErrors((...args) => {
            this.error(...args);
        });
        super._init({
            appName,
            appVersion,
            handlers: [
                new common_log_WriteToConsoleHandler.WriteToConsoleHandler(this, writeToConsoleLevels),
                logUrls && logUrls.length && new common_log_CombineLogHandlers.CombineLogHandlers(this, ...logUrls.map(logUrl => new browser_log_SendLogHandlerBrowser.SendLogHandlerBrowser(this, sendLogLevels, logUrl))),
                new common_log_EmitEventHandler.EmitEventHandler(this, emitEventLevels),
                new browser_log_SendToRemoteHandler.SendToRemoteHandler(this, sendToRemoteLevels, logFileName),
            ],
            filter,
            appState,
        });
    }
}
const logger = new LoggerBrowser();

exports.LoggerBrowser = LoggerBrowser;
exports.logger = logger;
