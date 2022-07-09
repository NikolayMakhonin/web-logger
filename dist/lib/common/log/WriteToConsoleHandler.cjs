'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var common_log_contracts = require('./contracts.cjs');
var common_log_intercept_interceptConsole = require('./intercept/interceptConsole.cjs');
var common_log_LogHandler = require('./LogHandler.cjs');
var common_log_objectToString = require('./objectToString.cjs');
require('./globalScope.cjs');
require('tslib');

function consoleLevelToLogLevel(consoleLevel) {
    switch (consoleLevel) {
        case 'debug':
            return common_log_contracts.LogLevel.Debug;
        case 'info':
            return common_log_contracts.LogLevel.Info;
        case 'log':
            return common_log_contracts.LogLevel.Info;
        case 'warn':
            return common_log_contracts.LogLevel.Warning;
        case 'error':
            return common_log_contracts.LogLevel.Error;
        default:
            return common_log_contracts.LogLevel.Error;
    }
}
class WriteToConsoleHandler extends common_log_LogHandler.LogHandler {
    constructor(logger, allowLogLevels) {
        super({
            name: 'writeToConsole',
            logger,
            allowLogLevels,
        });
    }
    init() {
        this.interceptConsole();
    }
    interceptConsole() {
        const self = this;
        common_log_intercept_interceptConsole.interceptConsole((_level, handlerOrig) => {
            const level = consoleLevelToLogLevel(_level);
            const writeToConsole = _level === 'warn' || _level === 'error'
                ? common_log_contracts.ActionMode.Never
                : common_log_contracts.ActionMode.Default;
            return function consoleHandler(...args) {
                self._logger.log({
                    level,
                    messagesOrErrors: args,
                    handlersModes: {
                        writeToConsole,
                    },
                });
                handlerOrig.apply(console, args.map(o => {
                    if (o instanceof Error) {
                        return common_log_objectToString.objectToString(o);
                    }
                    return o;
                }));
                return true;
            };
        });
    }
    handleLog(logEvents) {
        for (let i = 0, len = logEvents.length; i < len; i++) {
            const logEvent = logEvents[i];
            // let messagesOrErrors = logEvent.messagesOrErrors
            // if (!Array.isArray(messagesOrErrors)) {
            //  messagesOrErrors = [messagesOrErrors]
            // }
            switch (logEvent.level) {
                case common_log_contracts.LogLevel.None:
                case common_log_contracts.LogLevel.Trace:
                case common_log_contracts.LogLevel.Debug:
                    common_log_intercept_interceptConsole.consoleOrig.debug(logEvent.consoleString);
                    break;
                case common_log_contracts.LogLevel.Info:
                    common_log_intercept_interceptConsole.consoleOrig.info(logEvent.consoleString);
                    break;
                case common_log_contracts.LogLevel.UserAction:
                case common_log_contracts.LogLevel.Action:
                    common_log_intercept_interceptConsole.consoleOrig.log(logEvent.consoleString);
                    break;
                case common_log_contracts.LogLevel.UserWarning:
                case common_log_contracts.LogLevel.UserError:
                case common_log_contracts.LogLevel.Warning:
                    common_log_intercept_interceptConsole.consoleOrig.warn(logEvent.consoleString);
                    break;
                case common_log_contracts.LogLevel.Error:
                case common_log_contracts.LogLevel.Fatal:
                default:
                    common_log_intercept_interceptConsole.consoleOrig.error(logEvent.consoleString);
                    break;
            }
        }
    }
}

exports.WriteToConsoleHandler = WriteToConsoleHandler;
