'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib = require('tslib');
var common_log_LogHandler = require('./LogHandler.cjs');
require('./contracts.cjs');

class EmitEventHandler extends common_log_LogHandler.LogHandler {
    constructor(logger, allowLogLevels) {
        super({
            name: 'emitEvent',
            logger,
            allowLogLevels,
        });
    }
    handleLog(logEvents) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            for (let i = 0, len = logEvents.length; i < len; i++) {
                yield this._logger.onLog(logEvents[i]);
            }
        });
    }
}

exports.EmitEventHandler = EmitEventHandler;
