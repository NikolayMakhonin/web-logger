import { __awaiter } from 'tslib';
import parseUserAgent from 'ua-parser-js';
export { default as parseUserAgent } from 'ua-parser-js';
import { globalScope } from '../log/globalScope.mjs';

function parseSystemInfo(userAgentStr) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!userAgentStr) {
            return null;
        }
        const userAgent = parseUserAgent(userAgentStr);
        const os = userAgent.os && userAgent.os.name && (`${userAgent.os.name} ${userAgent.os.version || ''}`.trim());
        const device = typeof globalScope.getDeviceName === 'function'
            && (yield globalScope.getDeviceName())
            || userAgent.device
                && userAgent.device.vendor
                && (`${userAgent.device.vendor} ${userAgent.device.model || ''}`.trim())
            || 'desktop';
        return {
            device,
            os,
        };
    });
}

export { parseSystemInfo };
