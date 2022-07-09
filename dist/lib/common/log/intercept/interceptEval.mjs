import { globalScope } from '../globalScope.mjs';

const evalOrig = globalScope.eval.bind(globalScope.eval);
function interceptEval(handler) {
    delete globalScope.eval;
    globalScope.eval = str => {
        return handler(str, evalOrig);
    };
    return () => {
        delete globalScope.eval;
        globalScope.eval = evalOrig;
    };
}
function catchEvalErrors(errorHandler, filter) {
    return interceptEval((str, _evalOrig) => {
        try {
            return _evalOrig.call(globalScope, str);
        }
        catch (ex) {
            if (!filter || filter(str)) {
                errorHandler('eval error', ex, str);
            }
            throw ex;
        }
    });
}

export { catchEvalErrors, interceptEval };
