'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var common_log_contracts = require('./contracts.cjs');
var common_log_helpers = require('./helpers.cjs');
var common_log_objectToString = require('./objectToString.cjs');
require('./spark-md5.cjs');

function getStackTraceCountFrames(level) {
    switch (level) {
        case common_log_contracts.LogLevel.Error:
            return 50;
        case common_log_contracts.LogLevel.Fatal:
            return 100;
        case common_log_contracts.LogLevel.UserError:
            return 10;
        case common_log_contracts.LogLevel.UserWarning:
            return 10;
        case common_log_contracts.LogLevel.Warning:
            return 5;
        default:
            return 0;
    }
}
class LogEvent {
    constructor({ level, messagesOrErrors, handlersModes, time, stack, additionalHashString, appState, }) {
        this.level = level || common_log_contracts.LogLevel.Error;
        this.messagesOrErrors = messagesOrErrors;
        this.handlersModes = handlersModes;
        this.time = time || new Date();
        this.stack = stack;
        this.additionalHashString = additionalHashString;
        this.appState = appState;
        if (!this.stack) {
            const stackTraceCountFrames = getStackTraceCountFrames(this.level);
            if (stackTraceCountFrames > 0) {
                this.stack = new Error('StackTrace').stack;
            }
        }
    }
    get messages() {
        if (this._messages == null) {
            this._messages = this.messagesOrErrors
                ? (Array.isArray(this.messagesOrErrors)
                    ? this.messagesOrErrors
                    : [this.messagesOrErrors])
                    .filter(o => !(o instanceof Error))
                    .map(o => o
                    ? (typeof o === 'object'
                        ? common_log_objectToString.objectToString(o)
                        : o.toString())
                    : o + '')
                : [];
        }
        return this._messages;
    }
    get messagesString() {
        if (this._messagesString == null) {
            this._messagesString = this.messages.join('\r\n\r\n');
        }
        return this._messagesString;
    }
    get errors() {
        if (this._errors == null) {
            this._errors = this.messagesOrErrors
                ? (Array.isArray(this.messagesOrErrors)
                    ? this.messagesOrErrors
                    : [this.messagesOrErrors])
                    .filter(o => o instanceof Error)
                : [];
        }
        return this._errors;
    }
    get errorsString() {
        if (this._errorsString == null) {
            this._errorsString = this.errors
                .map(common_log_objectToString.objectToString)
                .join('\r\n\r\n');
        }
        return this._errorsString;
    }
    // endregion
    // region console
    get consoleLevel() {
        switch (this.level) {
            case common_log_contracts.LogLevel.None:
            case common_log_contracts.LogLevel.Trace:
            case common_log_contracts.LogLevel.Debug:
                return 'debug';
            case common_log_contracts.LogLevel.Info:
                return 'info';
            case common_log_contracts.LogLevel.UserAction:
            case common_log_contracts.LogLevel.Action:
                return 'log';
            case common_log_contracts.LogLevel.UserWarning:
            case common_log_contracts.LogLevel.UserError:
            case common_log_contracts.LogLevel.Warning:
                return 'warn';
            case common_log_contracts.LogLevel.Error:
            case common_log_contracts.LogLevel.Fatal:
            default:
                return 'error';
        }
    }
    get consoleString() {
        if (this._consoleString == null) {
            this._consoleString = `\r\n[${this.dateString}][${common_log_contracts.LogLevel[this.level]}]: ${this.bodyString}`;
        }
        return this._consoleString;
    }
    get dateString() {
        if (this._timeString == null) {
            this._timeString = this.time.toISOString().replace('T', ' ').replace('Z', '');
        }
        return this._timeString;
    }
    get stackString() {
        if (this._stackString == null) {
            this._stackString = this.stack || '';
        }
        return this._stackString;
    }
    get appInfo() {
        if (this._appInfo == null) {
            const { appState } = this;
            this._appInfo = appState ? JSON.stringify(appState, null, 4) : '';
        }
        return this._appInfo;
    }
    get md5Hash() {
        if (!this._md5Hash) {
            const buffer = [];
            if (this.additionalHashString) {
                buffer.push(this.additionalHashString);
            }
            const errors = this.errors;
            if (errors) {
                for (let i = 0, len = errors.length; i < len; i++) {
                    const error = errors[i];
                    let str = error.stack || error.toString();
                    if (str) {
                        const index = str.indexOf('\n');
                        if (index >= 0) {
                            str = str.substring(index + 1, str.length);
                        }
                    }
                    buffer.push(str);
                }
            }
            if (this.stack) {
                buffer.push(this.stack);
            }
            if (this.appInfo) {
                buffer.push(this.appInfo);
            }
            // if (!buffer.length && this.messagesString) {
            //   buffer.push(this.messagesString)
            // }
            const hashString = buffer.join('\r\n');
            this._md5Hash = common_log_helpers.md5(hashString);
        }
        return this._md5Hash;
    }
    get bodyString() {
        if (!this._bodyString) {
            const buffer = [];
            if (this.messagesString) {
                buffer.push(this.messagesString);
            }
            if (this.errorsString) {
                buffer.push(this.errorsString);
            }
            if (this.stackString) {
                buffer.push(this.stackString);
            }
            this._bodyString = buffer.join('\r\n\r\n');
        }
        return this._bodyString;
    }
}

exports.LogEvent = LogEvent;
