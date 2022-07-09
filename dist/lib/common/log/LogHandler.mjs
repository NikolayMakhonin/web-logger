import { __awaiter } from 'tslib';
import { ActionMode, LogLevel } from './contracts.mjs';

function canDoAction(actionMode, allowedLevels, level) {
    return actionMode === ActionMode.Always
        || actionMode !== ActionMode.Never && (allowedLevels & level) !== 0;
}
class LogHandler {
    constructor({ name, logger, allowLogLevels, maxLogSize, }) {
        this._queue = [];
        this.name = name;
        this._logger = logger;
        this.allowLogLevels = allowLogLevels == null
            ? LogLevel.Any
            : allowLogLevels;
        this._maxLogSize = maxLogSize || 50000;
    }
    init() {
    }
    canLog(logEvent) {
        return !this.disabled && canDoAction(logEvent.handlersModes
            ? logEvent.handlersModes[this.name] || logEvent.handlersModes._all || ActionMode.Default
            : ActionMode.Default, this.allowLogLevels, logEvent.level);
    }
    onError(logEvents, error) {
        handleLogErrorHandler(logEvents, error, this._logger, newLogEvent => {
            if (!newLogEvent.handlersModes) {
                newLogEvent.handlersModes = {};
            }
            newLogEvent.handlersModes[this.name] = ActionMode.Never;
        });
    }
    enqueueLog(logEvent) {
        const canLog = this.canLog(logEvent);
        if (!canLog) {
            return;
        }
        this._queue.push(logEvent);
        if (this._inProcess) {
            return;
        }
        void this.handleLogs();
    }
    handleLogs() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._inProcess) {
                return;
            }
            try {
                const { _queue } = this;
                do {
                    const len = _queue.length;
                    let endIndex = 0;
                    for (; endIndex < len; endIndex++) {
                        if (this.canLog(_queue[endIndex])) {
                            break;
                        }
                    }
                    if (endIndex >= _queue.length) {
                        _queue.length = 0;
                        break;
                    }
                    let startIndex = endIndex;
                    let logSize = 0;
                    while (true) {
                        logSize += _queue[startIndex].bodyString.length;
                        if (logSize >= this._maxLogSize) {
                            break;
                        }
                        if (startIndex === 0) {
                            break;
                        }
                        startIndex--;
                    }
                    const logEvents = _queue.slice(startIndex, endIndex + 1);
                    _queue.splice(0, endIndex + 1);
                    try {
                        yield this.handleLog(logEvents);
                    }
                    catch (err) {
                        this.onError(logEvents, err);
                    }
                } while (_queue.some(o => this.canLog(o)));
            }
            finally {
                this._inProcess = false;
            }
        });
    }
}
function handleLogErrorHandler(logEvents, error, logger, changeNewLogEvent) {
    const _changeNewLogEvent = (newLogEvent) => {
        changeNewLogEvent(newLogEvent);
        return newLogEvent;
    };
    // for (let i = 0, len = logEvents.length; i < len; i++) {
    //  const logEvent = logEvents[i]
    //  logger.log(_changeNewLogEvent({
    //    level: logEvent.level,
    //    message: logEvent.message,
    //    error: logEvent.error,
    //    stack: logEvent.stack,
    //    time: logEvent.time,
    //    writeConsoleMode: logEvent.writeConsoleMode,
    //    sendLogMode: logEvent.sendLogMode,
    //    writeFileMode: logEvent.writeFileMode,
    //  }))
    // }
    const lastLogEvent = logEvents[logEvents.length - 1];
    logger.log(_changeNewLogEvent({
        level: LogLevel.Error,
        messagesOrErrors: ['Logger self error', error],
        handlersModes: lastLogEvent.handlersModes,
    }));
}

export { LogHandler, canDoAction, handleLogErrorHandler };
