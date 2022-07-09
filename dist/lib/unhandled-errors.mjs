export { catchUnhandledErrors } from './common/log/intercept/catchUnhandledErrors.mjs';
export { CONSOLE_LEVELS, consoleOrig, interceptConsole } from './common/log/intercept/interceptConsole.mjs';
export { catchEvalErrors, interceptEval } from './common/log/intercept/interceptEval.mjs';
export { subscribeUnhandledErrors } from './common/log/subscribeUnhandledErrors.mjs';
import './common/log/globalScope.mjs';
import './common/log/intercept/InstrumentedPromise.mjs';
import './common/helpers/isNode.mjs';
import './common/log/objectToString.mjs';
