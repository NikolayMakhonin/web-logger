'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var common_log_contracts = require('../common/log/contracts.cjs');
var common_log_objectToString = require('../common/log/objectToString.cjs');
var common_log_EmitEventHandler = require('../common/log/EmitEventHandler.cjs');
var common_log_CombineLogHandlers = require('../common/log/CombineLogHandlers.cjs');
var common_log_LogHandler = require('../common/log/LogHandler.cjs');
var common_log_SendLogHandler = require('../common/log/SendLogHandler.cjs');
var common_log_WriteToConsoleHandler = require('../common/log/WriteToConsoleHandler.cjs');
var common_log_LogEvent = require('../common/log/LogEvent.cjs');
var common_log_Logger = require('../common/log/Logger.cjs');
var common_log_globalScope = require('../common/log/globalScope.cjs');
var common_log_delay = require('../common/log/delay.cjs');
var common_log_intercept_catchUnhandledErrors = require('../common/log/intercept/catchUnhandledErrors.cjs');
var common_log_intercept_interceptConsole = require('../common/log/intercept/interceptConsole.cjs');
var common_log_intercept_interceptEval = require('../common/log/intercept/interceptEval.cjs');
var common_log_subscribeUnhandledErrors = require('../common/log/subscribeUnhandledErrors.cjs');
var common_helpers_systemInfo = require('../common/helpers/system-info.cjs');
var node_log_LoggerNode = require('./log/LoggerNode.cjs');
var node_log_SendLogHandlerNode = require('./log/SendLogHandlerNode.cjs');
var node_log_WriteToFileHandler = require('./log/WriteToFileHandler.cjs');
var parseUserAgent = require('ua-parser-js');
require('tslib');
require('../common/log/helpers.cjs');
require('../common/log/spark-md5.cjs');
require('../common/log/intercept/InstrumentedPromise.cjs');
require('../common/helpers/isNode.cjs');
require('path');
require('needle');
require('fs/promises');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var parseUserAgent__default = /*#__PURE__*/_interopDefaultLegacy(parseUserAgent);



Object.defineProperty(exports, 'ActionMode', {
	enumerable: true,
	get: function () { return common_log_contracts.ActionMode; }
});
Object.defineProperty(exports, 'LogLevel', {
	enumerable: true,
	get: function () { return common_log_contracts.LogLevel; }
});
exports.filterDefault = common_log_objectToString.filterDefault;
exports.objectToString = common_log_objectToString.objectToString;
exports.EmitEventHandler = common_log_EmitEventHandler.EmitEventHandler;
exports.CombineLogHandlers = common_log_CombineLogHandlers.CombineLogHandlers;
exports.LogHandler = common_log_LogHandler.LogHandler;
exports.canDoAction = common_log_LogHandler.canDoAction;
exports.handleLogErrorHandler = common_log_LogHandler.handleLogErrorHandler;
exports.SendLogHandler = common_log_SendLogHandler.SendLogHandler;
exports.WriteToConsoleHandler = common_log_WriteToConsoleHandler.WriteToConsoleHandler;
exports.LogEvent = common_log_LogEvent.LogEvent;
exports.Logger = common_log_Logger.Logger;
exports.getGlobalScope = common_log_globalScope.getGlobalScope;
exports.globalScope = common_log_globalScope.globalScope;
exports.delay = common_log_delay.delay;
exports.catchUnhandledErrors = common_log_intercept_catchUnhandledErrors.catchUnhandledErrors;
exports.CONSOLE_LEVELS = common_log_intercept_interceptConsole.CONSOLE_LEVELS;
exports.consoleOrig = common_log_intercept_interceptConsole.consoleOrig;
exports.interceptConsole = common_log_intercept_interceptConsole.interceptConsole;
exports.catchEvalErrors = common_log_intercept_interceptEval.catchEvalErrors;
exports.interceptEval = common_log_intercept_interceptEval.interceptEval;
exports.subscribeUnhandledErrors = common_log_subscribeUnhandledErrors.subscribeUnhandledErrors;
exports.parseSystemInfo = common_helpers_systemInfo.parseSystemInfo;
exports.logger = node_log_LoggerNode.logger;
exports.SendLogHandlerNode = node_log_SendLogHandlerNode.SendLogHandlerNode;
exports.WriteToFileHandler = node_log_WriteToFileHandler.WriteToFileHandler;
Object.defineProperty(exports, 'parseUserAgent', {
	enumerable: true,
	get: function () { return parseUserAgent__default["default"]; }
});
