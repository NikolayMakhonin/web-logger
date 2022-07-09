'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var common_log_contracts = require('./contracts.cjs');

class CombineLogHandlers {
    constructor(logger, ...logHandlers) {
        this.name = logHandlers[0].name;
        this.logHandlers = logHandlers;
        this.allowLogLevels = common_log_contracts.LogLevel.Any;
    }
    init() {
        for (let i = 0, len = this.logHandlers.length; i < len; i++) {
            this.logHandlers[i].init();
        }
    }
    enqueueLog(logEvent) {
        for (let i = 0, len = this.logHandlers.length; i < len; i++) {
            this.logHandlers[i].enqueueLog(logEvent);
        }
    }
}

exports.CombineLogHandlers = CombineLogHandlers;
