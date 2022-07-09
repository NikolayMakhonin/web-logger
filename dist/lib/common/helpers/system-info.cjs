'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib = require('tslib');
var parseUserAgent = require('ua-parser-js');
var common_log_globalScope = require('../log/globalScope.cjs');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var parseUserAgent__default = /*#__PURE__*/_interopDefaultLegacy(parseUserAgent);

function parseSystemInfo(userAgentStr) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        if (!userAgentStr) {
            return null;
        }
        const userAgent = parseUserAgent__default["default"](userAgentStr);
        const os = userAgent.os && userAgent.os.name && (`${userAgent.os.name} ${userAgent.os.version || ''}`.trim());
        const device = typeof common_log_globalScope.globalScope.getDeviceName === 'function'
            && (yield common_log_globalScope.globalScope.getDeviceName())
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

Object.defineProperty(exports, 'parseUserAgent', {
    enumerable: true,
    get: function () { return parseUserAgent__default["default"]; }
});
exports.parseSystemInfo = parseSystemInfo;
