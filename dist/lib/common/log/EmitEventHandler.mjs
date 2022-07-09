import { __awaiter } from 'tslib';
import { LogHandler } from './LogHandler.mjs';
import './contracts.mjs';

class EmitEventHandler extends LogHandler {
    constructor(logger, allowLogLevels) {
        super({
            name: 'emitEvent',
            logger,
            allowLogLevels,
        });
    }
    handleLog(logEvents) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0, len = logEvents.length; i < len; i++) {
                yield this._logger.onLog(logEvents[i]);
            }
        });
    }
}

export { EmitEventHandler };
