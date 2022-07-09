'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib = require('tslib');
var common_log_LogHandler = require('../../common/log/LogHandler.cjs');
var common_log_globalScope = require('../../common/log/globalScope.cjs');
require('../../common/log/contracts.cjs');

class SendToRemoteHandler extends common_log_LogHandler.LogHandler {
    constructor(logger, allowLogLevels, logFileName) {
        super({
            name: 'sendToRemote',
            logger,
            allowLogLevels,
        });
        this._logFileName = logFileName;
    }
    get logFileName() {
        return this._logFileName;
    }
    set logFileName(value) {
        this._logFileName = value;
        console.log(`logFileName = ${this._logFileName}`);
        if (typeof common_log_globalScope.globalScope.remoteLogger === 'object') {
            common_log_globalScope.globalScope.remoteLogger.setFileName(value);
        }
    }
    handleLog(logEvents) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const remoteLogger = typeof common_log_globalScope.globalScope.remoteLogger === 'object'
                ? common_log_globalScope.globalScope.remoteLogger
                : null;
            if (!remoteLogger) {
                return;
            }
            const sendLogEvents = logEvents;
            yield remoteLogger.send(...sendLogEvents);
        });
    }
}

exports.SendToRemoteHandler = SendToRemoteHandler;
