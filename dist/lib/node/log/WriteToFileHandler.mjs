import { __awaiter } from 'tslib';
import { LogLevel } from '../../common/log/contracts.mjs';
import { LogHandler } from '../../common/log/LogHandler.mjs';
import fsp from 'fs/promises';
import path from 'path';

function autoCutLogFile(filePath, maxSize, cutToSize) {
    return __awaiter(this, void 0, void 0, function* () {
        const stat = yield fsp.stat(filePath).catch(() => null);
        if (!(stat === null || stat === void 0 ? void 0 : stat.isFile) || stat.size < maxSize) {
            return;
        }
        const content = yield fsp.readFile(filePath, { encoding: 'utf8' });
        if (content.length < cutToSize) {
            return;
        }
        yield fsp.writeFile(filePath, content.substring(content.length - cutToSize), { encoding: 'utf8' });
    });
}
class WriteToFileHandler extends LogHandler {
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
        return path.resolve(this.logDir, this.logFileName);
    }
    handleLog(logEvents) {
        return __awaiter(this, void 0, void 0, function* () {
            const logText = logEvents.map(logEvent => `\r\n\r\n[${this._logger.appVersion}][${logEvent.dateString}][${this._logger.appName}][${LogLevel[logEvent.level]}]: ${logEvent.bodyString}`).join('');
            const { logFilePath } = this;
            const dirOutput = path.dirname(logFilePath);
            yield fsp.mkdir(dirOutput, { recursive: true });
            yield fsp.appendFile(logFilePath, logText);
            yield autoCutLogFile(logFilePath, 1000000, 500000);
        });
    }
}

export { WriteToFileHandler };
