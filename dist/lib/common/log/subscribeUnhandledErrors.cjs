'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var common_log_globalScope = require('./globalScope.cjs');
var common_log_objectToString = require('./objectToString.cjs');
var common_log_intercept_catchUnhandledErrors = require('./intercept/catchUnhandledErrors.cjs');
var common_log_intercept_interceptConsole = require('./intercept/interceptConsole.cjs');
var common_log_intercept_interceptEval = require('./intercept/interceptEval.cjs');
require('./intercept/InstrumentedPromise.cjs');
require('../helpers/isNode.cjs');

function subscribeUnhandledErrors({ catchUnhandled = true, catchEval = true, catchConsoleLevels = ['error'], filterEval = null, alert: _alert = false, maxLogLength = 2048, customLog, } = {}) {
    const unsubscribers = [];
    if (catchUnhandled) {
        unsubscribers.push(common_log_intercept_catchUnhandledErrors.catchUnhandledErrors((...args) => {
            if (typeof catchUnhandled === 'function' && catchUnhandled(...args)) {
                return;
            }
            if (catchUnhandled) {
                errorHandler(...args);
            }
        }));
    }
    if (catchConsoleLevels && catchConsoleLevels.length > 0) {
        unsubscribers.push(common_log_intercept_interceptConsole.interceptConsole((level, handlerOrig) => {
            let handler;
            if (typeof catchConsoleLevels === 'function') {
                handler = catchConsoleLevels(level, handlerOrig);
                if (typeof handler !== 'function' && handler) {
                    return handler;
                }
            }
            else if (Array.isArray(catchConsoleLevels) && !catchConsoleLevels.includes(level)) {
                return null;
            }
            return (...args) => {
                if (handler && handler(...args)) {
                    return;
                }
                if (catchConsoleLevels) {
                    errorHandler('console error', ...args);
                }
            };
        }));
    }
    if (catchEval) {
        unsubscribers.push(common_log_intercept_interceptEval.catchEvalErrors((...args) => {
            if (typeof catchEval === 'function' && catchEval(...args)) {
                return;
            }
            if (catchEval) {
                errorHandler(...args);
            }
        }, filterEval));
    }
    function errorHandler(...args) {
        let log = args
            .map(o => common_log_objectToString.objectToString(o))
            .join('\n');
        if (maxLogLength && log.length > maxLogLength) {
            log = log.substring(0, maxLogLength - 3) + '...';
        }
        if (customLog && customLog(log)) {
            return;
        }
        if (_alert && common_log_globalScope.globalScope.alert) {
            common_log_globalScope.globalScope.alert(log);
        }
        common_log_intercept_interceptConsole.consoleOrig.error(log);
    }
    return function unsubscribe() {
        for (let i = 0, len = unsubscribers.length; i < len; i++) {
            unsubscribers[i]();
        }
    };
}

exports.subscribeUnhandledErrors = subscribeUnhandledErrors;
