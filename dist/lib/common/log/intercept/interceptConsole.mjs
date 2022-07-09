import { globalScope } from '../globalScope.mjs';

const CONSOLE_LEVELS = Object.freeze(['debug', 'info', 'log', 'warn', 'error']);
const consoleOrig = {
    debug: globalScope.console.debug.bind(globalScope.console),
    info: globalScope.console.info.bind(globalScope.console),
    log: globalScope.console.log.bind(globalScope.console),
    warn: globalScope.console.warn.bind(globalScope.console),
    error: globalScope.console.error.bind(globalScope.console),
};
function interceptConsole(handlerFactory, levels) {
    if (!levels) {
        levels = CONSOLE_LEVELS;
    }
    for (let i = 0, len = levels.length; i < len; i++) {
        const level = levels[i];
        const handlerOrig = consoleOrig[level];
        const _handler = handlerFactory(level, handlerOrig);
        if (typeof _handler !== 'function' && _handler) {
            continue;
        }
        if (_handler) {
            const handler = function handler() {
                if (_handler.apply(globalScope.console, arguments)) {
                    return;
                }
                handlerOrig.apply(globalScope.console, arguments);
            };
            globalScope.console[level] = handler;
        }
    }
    return () => {
        for (let i = 0, len = levels.length; i < len; i++) {
            const level = levels[i];
            globalScope.console[level] = consoleOrig[level];
        }
    };
}

export { CONSOLE_LEVELS, consoleOrig, interceptConsole };
