import { ActionMode, LogLevel } from './contracts.mjs';
import { interceptConsole, consoleOrig } from './intercept/interceptConsole.mjs';
import { LogHandler } from './LogHandler.mjs';
import { objectToString } from './objectToString.mjs';
import './globalScope.mjs';
import 'tslib';

function consoleLevelToLogLevel(consoleLevel) {
    switch (consoleLevel) {
        case 'debug':
            return LogLevel.Debug;
        case 'info':
            return LogLevel.Info;
        case 'log':
            return LogLevel.Info;
        case 'warn':
            return LogLevel.Warning;
        case 'error':
            return LogLevel.Error;
        default:
            return LogLevel.Error;
    }
}
class WriteToConsoleHandler extends LogHandler {
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
        interceptConsole((_level, handlerOrig) => {
            const level = consoleLevelToLogLevel(_level);
            const writeToConsole = _level === 'warn' || _level === 'error'
                ? ActionMode.Never
                : ActionMode.Default;
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
                        return objectToString(o);
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
                case LogLevel.None:
                case LogLevel.Trace:
                case LogLevel.Debug:
                    consoleOrig.debug(logEvent.consoleString);
                    break;
                case LogLevel.Info:
                    consoleOrig.info(logEvent.consoleString);
                    break;
                case LogLevel.UserAction:
                case LogLevel.Action:
                    consoleOrig.log(logEvent.consoleString);
                    break;
                case LogLevel.UserWarning:
                case LogLevel.UserError:
                case LogLevel.Warning:
                    consoleOrig.warn(logEvent.consoleString);
                    break;
                case LogLevel.Error:
                case LogLevel.Fatal:
                default:
                    consoleOrig.error(logEvent.consoleString);
                    break;
            }
        }
    }
}

export { WriteToConsoleHandler };
