'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib = require('tslib');
var common_log_contracts = require('./contracts.cjs');
var common_log_LogEvent = require('./LogEvent.cjs');
var common_log_intercept_interceptEval = require('./intercept/interceptEval.cjs');
require('./helpers.cjs');
require('./spark-md5.cjs');
require('./objectToString.cjs');
require('./globalScope.cjs');

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
            common_log_intercept_interceptEval.catchEvalErrors((...args) => {
                this.error(...args);
            });
        }
        const logEvent = {
            level: common_log_contracts.LogLevel.Info,
            messagesOrErrors: `Start App: ${appName} v${appVersion}`,
            handlersModes: {
                _all: common_log_contracts.ActionMode.Always,
            },
        };
        this.log(logEvent);
    }
    // endregion
    // region log interface
    debug(...messagesOrErrors) {
        this.log({
            level: common_log_contracts.LogLevel.Debug,
            messagesOrErrors,
        });
    }
    info(...messagesOrErrors) {
        this.log({
            level: common_log_contracts.LogLevel.Info,
            messagesOrErrors,
        });
    }
    action(...messagesOrErrors) {
        this.log({
            level: common_log_contracts.LogLevel.Action,
            messagesOrErrors,
        });
    }
    warn(...messagesOrErrors) {
        this.log({
            level: common_log_contracts.LogLevel.Warning,
            messagesOrErrors,
        });
    }
    error(...messagesOrErrors) {
        this.log({
            level: common_log_contracts.LogLevel.Error,
            messagesOrErrors,
        });
    }
    log(logEventOrLevel, ...messagesOrErrors) {
        if (logEventOrLevel != null && typeof logEventOrLevel === 'object') {
            this._log(logEventOrLevel instanceof common_log_LogEvent.LogEvent
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
        return new common_log_LogEvent.LogEvent(params);
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
        return tslib.__awaiter(this, void 0, void 0, function* () {
            if (this._subscribers.length) {
                for (let i = 0; i < this._subscribers.length; i++) {
                    const subscriber = this._subscribers[i];
                    try {
                        yield subscriber(logEvent);
                    }
                    catch (error) {
                        this._subscribers.splice(i, 1);
                        this.log(new common_log_LogEvent.LogEvent({
                            level: common_log_contracts.LogLevel.Error,
                            messagesOrErrors: [`onLog() error in ${subscriber}`, error],
                        }));
                    }
                }
            }
        });
    }
}
// endregion

exports.Logger = Logger;
