'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var common_log_intercept_catchUnhandledErrors = require('./common/log/intercept/catchUnhandledErrors.cjs');
var common_log_intercept_interceptConsole = require('./common/log/intercept/interceptConsole.cjs');
var common_log_intercept_interceptEval = require('./common/log/intercept/interceptEval.cjs');
var common_log_subscribeUnhandledErrors = require('./common/log/subscribeUnhandledErrors.cjs');
require('./common/log/globalScope.cjs');
require('./common/log/intercept/InstrumentedPromise.cjs');
require('./common/helpers/isNode.cjs');
require('./common/log/objectToString.cjs');



exports.catchUnhandledErrors = common_log_intercept_catchUnhandledErrors.catchUnhandledErrors;
exports.CONSOLE_LEVELS = common_log_intercept_interceptConsole.CONSOLE_LEVELS;
exports.consoleOrig = common_log_intercept_interceptConsole.consoleOrig;
exports.interceptConsole = common_log_intercept_interceptConsole.interceptConsole;
exports.catchEvalErrors = common_log_intercept_interceptEval.catchEvalErrors;
exports.interceptEval = common_log_intercept_interceptEval.interceptEval;
exports.subscribeUnhandledErrors = common_log_subscribeUnhandledErrors.subscribeUnhandledErrors;
