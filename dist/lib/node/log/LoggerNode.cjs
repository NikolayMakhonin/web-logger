'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var common_log_CombineLogHandlers = require('../../common/log/CombineLogHandlers.cjs');
var common_log_contracts = require('../../common/log/contracts.cjs');
var common_log_EmitEventHandler = require('../../common/log/EmitEventHandler.cjs');
var common_log_Logger = require('../../common/log/Logger.cjs');
var common_log_intercept_catchUnhandledErrors = require('../../common/log/intercept/catchUnhandledErrors.cjs');
var common_log_WriteToConsoleHandler = require('../../common/log/WriteToConsoleHandler.cjs');
var node_log_SendLogHandlerNode = require('./SendLogHandlerNode.cjs');
var node_log_WriteToFileHandler = require('./WriteToFileHandler.cjs');
var path = require('path');
require('tslib');
require('../../common/log/LogHandler.cjs');
require('../../common/log/LogEvent.cjs');
require('../../common/log/helpers.cjs');
require('../../common/log/spark-md5.cjs');
require('../../common/log/objectToString.cjs');
require('../../common/log/intercept/interceptEval.cjs');
require('../../common/log/globalScope.cjs');
require('../../common/log/intercept/InstrumentedPromise.cjs');
require('../../common/helpers/isNode.cjs');
require('../../common/log/intercept/interceptConsole.cjs');
require('../../common/log/SendLogHandler.cjs');
require('../../common/log/delay.cjs');
require('needle');
require('fs/promises');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var path__default = /*#__PURE__*/_interopDefaultLegacy(path);

class LoggerNode extends common_log_Logger.Logger {
    init({ appName, appVersion, logDir, logFileName = 'log.log', logUrls, writeToConsoleLevels = common_log_contracts.LogLevel.Any, writeToFileLevels = common_log_contracts.LogLevel.Fatal | common_log_contracts.LogLevel.Error | common_log_contracts.LogLevel.Warning
        | common_log_contracts.LogLevel.UserError | common_log_contracts.LogLevel.UserWarning, sendLogLevels = common_log_contracts.LogLevel.Fatal | common_log_contracts.LogLevel.Error | common_log_contracts.LogLevel.Warning | common_log_contracts.LogLevel.UserError | common_log_contracts.LogLevel.UserWarning, emitEventLevels = common_log_contracts.LogLevel.Any, filter, appState, interceptEval, }) {
        common_log_intercept_catchUnhandledErrors.catchUnhandledErrors((...args) => {
            this.error(...args);
        });
        super._init({
            appName,
            appVersion,
            handlers: [
                new common_log_WriteToConsoleHandler.WriteToConsoleHandler(this, writeToConsoleLevels),
                logDir && new node_log_WriteToFileHandler.WriteToFileHandler(this, writeToFileLevels, path__default["default"].resolve(logDir), logFileName),
                logUrls && logUrls.length && new common_log_CombineLogHandlers.CombineLogHandlers(this, ...logUrls.map(logUrl => new node_log_SendLogHandlerNode.SendLogHandlerNode(this, sendLogLevels, logUrl))),
                new common_log_EmitEventHandler.EmitEventHandler(this, emitEventLevels),
            ],
            filter,
            appState,
            interceptEval,
        });
    }
}
const logger = new LoggerNode();

exports.LoggerNode = LoggerNode;
exports.logger = logger;
