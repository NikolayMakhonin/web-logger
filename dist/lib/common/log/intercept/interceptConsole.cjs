'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var common_log_globalScope = require('../globalScope.cjs');

const CONSOLE_LEVELS = Object.freeze(['debug', 'info', 'log', 'warn', 'error']);
const consoleOrig = {
    debug: common_log_globalScope.globalScope.console.debug.bind(common_log_globalScope.globalScope.console),
    info: common_log_globalScope.globalScope.console.info.bind(common_log_globalScope.globalScope.console),
    log: common_log_globalScope.globalScope.console.log.bind(common_log_globalScope.globalScope.console),
    warn: common_log_globalScope.globalScope.console.warn.bind(common_log_globalScope.globalScope.console),
    error: common_log_globalScope.globalScope.console.error.bind(common_log_globalScope.globalScope.console),
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
                if (_handler.apply(common_log_globalScope.globalScope.console, arguments)) {
                    return;
                }
                handlerOrig.apply(common_log_globalScope.globalScope.console, arguments);
            };
            common_log_globalScope.globalScope.console[level] = handler;
        }
    }
    return () => {
        for (let i = 0, len = levels.length; i < len; i++) {
            const level = levels[i];
            common_log_globalScope.globalScope.console[level] = consoleOrig[level];
        }
    };
}

exports.CONSOLE_LEVELS = CONSOLE_LEVELS;
exports.consoleOrig = consoleOrig;
exports.interceptConsole = interceptConsole;
