import { __awaiter } from 'tslib';
import { LogLevel, ActionMode } from './contracts.mjs';
import { LogEvent } from './LogEvent.mjs';
import { catchEvalErrors } from './intercept/interceptEval.mjs';
import './helpers.mjs';
import './spark-md5.cjs';
import './objectToString.mjs';
import './globalScope.mjs';

// region Logger
class Logger {
    constructor() {
        this.minTimeBetweenEqualEvents = 120000;
        this._logEventsTime = {};
        // endregion
        // region log event
        this._subscribers = [];
        // endregion
    }
    _init({ appName, appVersion, handlers, filter, appState, interceptEval: _interceptEval, }) {
        if (this._initialized) {
            this.error('Logger already initialized');
            return;
        }
        this._initialized = true;
        this.appName = appName;
        this.appVersion = appVersion;
        const handlersObject = {};
        for (let i = 0, len = handlers.length; i < len; i++) {
            const handler = handlers[i];
            if (handler) {
                handlersObject[handler.name] = handler;
                handler.init();
            }
        }
        this.handlers = handlersObject;
        this.filter = filter;
        this.appState = appState;
        if (_interceptEval) {
            catchEvalErrors((...args) => {
                this.error(...args);
            });
        }
        const logEvent = {
            level: LogLevel.Info,
            messagesOrErrors: `Start App: ${appName} v${appVersion}`,
            handlersModes: {
                _all: ActionMode.Always,
            },
        };
        this.log(logEvent);
    }
    // endregion
    // region log interface
    debug(...messagesOrErrors) {
        this.log({
            level: LogLevel.Debug,
            messagesOrErrors,
        });
    }
    info(...messagesOrErrors) {
        this.log({
            level: LogLevel.Info,
            messagesOrErrors,
        });
    }
    action(...messagesOrErrors) {
        this.log({
            level: LogLevel.Action,
            messagesOrErrors,
        });
    }
    warn(...messagesOrErrors) {
        this.log({
            level: LogLevel.Warning,
            messagesOrErrors,
        });
    }
    error(...messagesOrErrors) {
        this.log({
            level: LogLevel.Error,
            messagesOrErrors,
        });
    }
    log(logEventOrLevel, ...messagesOrErrors) {
        if (logEventOrLevel != null && typeof logEventOrLevel === 'object') {
            this._log(logEventOrLevel instanceof LogEvent
                ? logEventOrLevel
                : this.createLogEvent(logEventOrLevel));
        }
        else {
            this._log(this.createLogEvent({
                level: logEventOrLevel,
                messagesOrErrors,
            }));
        }
    }
    // endregion
    // region log handlers
    createLogEvent(params) {
        params.appState = Object.assign({ appName: this.appName, appVersion: this.appVersion }, this.appState);
        return new LogEvent(params);
    }
    _log(logEvent) {
        const { filter } = this;
        if (filter && !filter(logEvent)) {
            return;
        }
        const { _logEventsTime } = this;
        const time = _logEventsTime[logEvent.bodyString];
        if (time != null && time + this.minTimeBetweenEqualEvents > logEvent.time.getTime()) {
            return;
        }
        _logEventsTime[logEvent.bodyString] = logEvent.time.getTime();
        const { handlers } = this;
        for (const key in handlers) {
            if (Object.prototype.hasOwnProperty.call(handlers, key)) {
                const handler = handlers[key];
                if (handler) {
                    handler.enqueueLog(logEvent);
                }
            }
        }
    }
    subscribe(subscriber) {
        this._subscribers.push(subscriber);
        return () => {
            const index = this._subscribers.indexOf(subscriber);
            if (index >= 0) {
                this._subscribers.splice(index, 1);
            }
        };
    }
    onLog(logEvent) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._subscribers.length) {
                for (let i = 0; i < this._subscribers.length; i++) {
                    const subscriber = this._subscribers[i];
                    try {
                        yield subscriber(logEvent);
                    }
                    catch (error) {
                        this._subscribers.splice(i, 1);
                        this.log(new LogEvent({
                            level: LogLevel.Error,
                            messagesOrErrors: [`onLog() error in ${subscriber}`, error],
                        }));
                    }
                }
            }
        });
    }
}
// endregion

export { Logger };
