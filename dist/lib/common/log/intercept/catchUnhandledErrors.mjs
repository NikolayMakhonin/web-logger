import { globalScope } from '../globalScope.mjs';
import { needUnhandledRejectionPolyfill, InstrumentedPromise, OriginalPromise } from './InstrumentedPromise.mjs';
import { isNode } from '../../helpers/isNode.mjs';

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
    if (needUnhandledRejectionPolyfill) {
        globalScope.Promise = InstrumentedPromise;
    }
    if (isNode && process.on) {
        process
            .on('unhandledRejection', processUnhandledRejectionHandler)
            .on('uncaughtException', processUncaughtExceptionHandler);
    }
    if (globalScope.addEventListener) {
        globalScope.addEventListener('unhandledrejection', unhandledrejectionHandler);
        globalScope.onunhandledrejection = unhandledrejectionHandler;
        // see: https://stackoverflow.com/a/28771916/5221762
        globalScope.addEventListener('error', unhandledErrorHandler, true);
        globalScope.onerror = unhandledErrorHandler;
    }
    return () => {
        if (needUnhandledRejectionPolyfill) {
            globalScope.Promise = OriginalPromise;
        }
        if (isNode && process.off) {
            process
                .off('unhandledRejection', processUnhandledRejectionHandler)
                .off('uncaughtException', processUncaughtExceptionHandler);
        }
        if (globalScope.removeEventListener) {
            globalScope.removeEventListener('unhandledrejection', unhandledrejectionHandler);
            globalScope.onunhandledrejection = null;
            globalScope.removeEventListener('error', unhandledErrorHandler, true);
            globalScope.onerror = null;
        }
    };
}

export { catchUnhandledErrors };
