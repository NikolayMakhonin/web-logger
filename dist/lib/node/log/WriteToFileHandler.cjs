'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib = require('tslib');
var common_log_contracts = require('../../common/log/contracts.cjs');
var common_log_LogHandler = require('../../common/log/LogHandler.cjs');
var fsp = require('fs/promises');
var path = require('path');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fsp__default = /*#__PURE__*/_interopDefaultLegacy(fsp);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);

function autoCutLogFile(filePath, maxSize, cutToSize) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        const stat = yield fsp__default["default"].stat(filePath).catch(() => null);
        if (!(stat === null || stat === void 0 ? void 0 : stat.isFile) || stat.size < maxSize) {
            return;
        }
        const content = yield fsp__default["default"].readFile(filePath, { encoding: 'utf8' });
        if (content.length < cutToSize) {
            return;
        }
        yield fsp__default["default"].writeFile(filePath, content.substring(content.length - cutToSize), { encoding: 'utf8' });
    });
}
class WriteToFileHandler extends common_log_LogHandler.LogHandler {
    constructor(logger, allowLogLevels, logDir, logFileName) {
        super({
            name: 'writeToFile',
            logger,
            allowLogLevels,
        });
        this.logDir = logDir;
        this.logFileName = logFileName;
    }
    get logFilePath() {
        return path__default["default"].resolve(this.logDir, this.logFileName);
    }
    handleLog(logEvents) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const logText = logEvents.map(logEvent => `\r\n\r\n[${this._logger.appVersion}][${logEvent.dateString}][${this._logger.appName}][${common_log_contracts.LogLevel[logEvent.level]}]: ${logEvent.bodyString}`).join('');
            const { logFilePath } = this;
            const dirOutput = path__default["default"].dirname(logFilePath);
            yield fsp__default["default"].mkdir(dirOutput, { recursive: true });
            yield fsp__default["default"].appendFile(logFilePath, logText);
            yield autoCutLogFile(logFilePath, 1000000, 500000);
        });
    }
}

exports.WriteToFileHandler = WriteToFileHandler;
