'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var common_log_globalScope = require('../globalScope.cjs');
var common_log_intercept_InstrumentedPromise = require('./InstrumentedPromise.cjs');
var common_helpers_isNode = require('../../helpers/isNode.cjs');

function prepareArgs(args) {
    return args.map(arg => {
        if (typeof PromiseRejectionEvent !== 'undefined' && arg instanceof PromiseRejectionEvent) {
            return arg.reason || arg;
        }
        if (typeof Event !== 'undefined' && typeof Element !== 'undefined'
            && arg instanceof Event
            && arg.target instanceof Element) {
            if ('src' in arg.target) {
                return `Error load: ${arg.target.src}\r\n${arg.target.outerHTML}`;
            }
        }
        return arg.reason || arg;
    });
}
function catchUnhandledErrors(errorHandler) {
    let handled = false;
    function handlerFactory(message) {
        return (...args) => {
            if (handled) {
                return;
            }
            handled = true;
            setTimeout(() => {
                handled = false;
            });
            errorHandler(message, ...prepareArgs(args));
        };
    }
    const processUnhandledRejectionHandler = handlerFactory('process.unhandledRejection');
    const processUncaughtExceptionHandler = handlerFactory('process.uncaughtException');
    const unhandledrejectionHandler = handlerFactory('unhandledrejection');
    const unhandledErrorHandler = handlerFactory('unhandled error');
    if (common_log_intercept_InstrumentedPromise.needUnhandledRejectionPolyfill) {
        common_log_globalScope.globalScope.Promise = common_log_intercept_InstrumentedPromise.InstrumentedPromise;
    }
    if (common_helpers_isNode.isNode && process.on) {
        process
            .on('unhandledRejection', processUnhandledRejectionHandler)
            .on('uncaughtException', processUncaughtExceptionHandler);
    }
    if (common_log_globalScope.globalScope.addEventListener) {
        common_log_globalScope.globalScope.addEventListener('unhandledrejection', unhandledrejectionHandler);
        common_log_globalScope.globalScope.onunhandledrejection = unhandledrejectionHandler;
        // see: https://stackoverflow.com/a/28771916/5221762
        common_log_globalScope.globalScope.addEventListener('error', unhandledErrorHandler, true);
        common_log_globalScope.globalScope.onerror = unhandledErrorHandler;
    }
    return () => {
        if (common_log_intercept_InstrumentedPromise.needUnhandledRejectionPolyfill) {
            common_log_globalScope.globalScope.Promise = common_log_intercept_InstrumentedPromise.OriginalPromise;
        }
        if (common_helpers_isNode.isNode && process.off) {
            process
                .off('unhandledRejection', processUnhandledRejectionHandler)
                .off('uncaughtException', processUncaughtExceptionHandler);
        }
        if (common_log_globalScope.globalScope.removeEventListener) {
            common_log_globalScope.globalScope.removeEventListener('unhandledrejection', unhandledrejectionHandler);
            common_log_globalScope.globalScope.onunhandledrejection = null;
            common_log_globalScope.globalScope.removeEventListener('error', unhandledErrorHandler, true);
            common_log_globalScope.globalScope.onerror = null;
        }
    };
}

exports.catchUnhandledErrors = catchUnhandledErrors;
