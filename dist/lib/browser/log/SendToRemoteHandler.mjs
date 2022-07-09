import { __awaiter } from 'tslib';
import { LogHandler } from '../../common/log/LogHandler.mjs';
import { globalScope } from '../../common/log/globalScope.mjs';
import '../../common/log/contracts.mjs';

class SendToRemoteHandler extends LogHandler {
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
        if (typeof globalScope.remoteLogger === 'object') {
            globalScope.remoteLogger.setFileName(value);
        }
    }
    handleLog(logEvents) {
        return __awaiter(this, void 0, void 0, function* () {
            const remoteLogger = typeof globalScope.remoteLogger === 'object'
                ? globalScope.remoteLogger
                : null;
            if (!remoteLogger) {
                return;
            }
            const sendLogEvents = logEvents;
            yield remoteLogger.send(...sendLogEvents);
        });
    }
}

export { SendToRemoteHandler };
