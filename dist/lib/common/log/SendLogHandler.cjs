'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib = require('tslib');
var common_log_contracts = require('./contracts.cjs');
var common_log_delay = require('./delay.cjs');
var common_log_helpers = require('./helpers.cjs');
var common_log_LogHandler = require('./LogHandler.cjs');
require('./spark-md5.cjs');

class SendLogHandler extends common_log_LogHandler.LogHandler {
    constructor(logger, allowLogLevels, logUrl) {
        super({
            name: 'sendLog',
            logger,
            allowLogLevels,
        });
        this.logUrl = logUrl;
    }
    handleLog(logEvents) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const { logUrl } = this;
            if (!logUrl || !logUrl.length) {
                return;
            }
            const lastLogEvent = logEvents[logEvents.length - 1];
            const selfError = (...messagesOrErrors) => {
                this._logger.log({
                    level: common_log_contracts.LogLevel.Error,
                    messagesOrErrors,
                    handlersModes: Object.assign(Object.assign({}, lastLogEvent.handlersModes), { [this.name]: common_log_contracts.ActionMode.Never }),
                });
            };
            let errorWasWrite = false;
            let body = logEvents
                .slice()
                .reverse()
                .map((logEvent, index) => {
                let logStr = `[${logEvent.dateString}][${this._logger.appName}][${common_log_contracts.LogLevel[logEvent.level]}][${index}]: ${logEvent.bodyString}`;
                if (index === 0) {
                    logStr += `\r\n\r\nAppInfo: ${logEvent.appInfo}`;
                }
                return common_log_helpers.escapeHtml(logStr);
            })
                .join('\r\n<hr>\r\n');
            body = lastLogEvent.md5Hash + '\r\n\r\n' + body;
            const token = common_log_helpers.md5(lastLogEvent.md5Hash + '607bf405-a5a8-4b8c-aa61-41e8c1208dba');
            const message = {
                Token: token,
                Hash: lastLogEvent.md5Hash,
                AppName: this._logger.appName,
                AppVersion: this._logger.appVersion,
                Type: common_log_contracts.LogLevel[lastLogEvent.level],
                Time: lastLogEvent.time.toISOString(),
                MessageFull: body,
                MessageShort: common_log_helpers.removeExcessSpaces(lastLogEvent.bodyString.substring(0, 200)),
            };
            let delayTime = 10000;
            const maxDelayTime = 300000;
            while (true) {
                try {
                    const { statusCode } = yield this.sendLog(logUrl, message, selfError);
                    if (statusCode === 200) {
                        return;
                    }
                    if (statusCode === 429 || statusCode === 502 || statusCode === 504) {
                        console.debug('Send log failed: Bad Connection');
                    }
                    else if (!errorWasWrite) {
                        errorWasWrite = true;
                        selfError('Send log status code == ' + statusCode);
                    }
                }
                catch (error) {
                    console.debug('Send log failed: Bad Connection');
                    // if (!errorWasWrite) {
                    //  errorWasWrite = true
                    //  selfError('Send log error', error)
                    // }
                }
                yield common_log_delay.delay(delayTime);
                delayTime *= 2;
                if (delayTime > maxDelayTime) {
                    delayTime = maxDelayTime;
                }
            }
        });
    }
}

exports.SendLogHandler = SendLogHandler;
