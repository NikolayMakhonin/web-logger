'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var common_log_globalScope = require('../globalScope.cjs');

const evalOrig = common_log_globalScope.globalScope.eval.bind(common_log_globalScope.globalScope.eval);
function interceptEval(handler) {
    delete common_log_globalScope.globalScope.eval;
    common_log_globalScope.globalScope.eval = str => {
        return handler(str, evalOrig);
    };
    return () => {
        delete common_log_globalScope.globalScope.eval;
        common_log_globalScope.globalScope.eval = evalOrig;
    };
}
function catchEvalErrors(errorHandler, filter) {
    return interceptEval((str, _evalOrig) => {
        try {
            return _evalOrig.call(common_log_globalScope.globalScope, str);
        }
        catch (ex) {
            if (!filter || filter(str)) {
                errorHandler('eval error', ex, str);
            }
            throw ex;
        }
    });
}

exports.catchEvalErrors = catchEvalErrors;
exports.interceptEval = interceptEval;
