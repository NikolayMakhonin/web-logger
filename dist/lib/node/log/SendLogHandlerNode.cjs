'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var common_log_SendLogHandler = require('../../common/log/SendLogHandler.cjs');
var needle = require('needle');
require('tslib');
require('../../common/log/contracts.cjs');
require('../../common/log/delay.cjs');
require('../../common/log/helpers.cjs');
require('../../common/log/spark-md5.cjs');
require('../../common/log/LogHandler.cjs');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var needle__default = /*#__PURE__*/_interopDefaultLegacy(needle);

class SendLogHandlerNode extends common_log_SendLogHandler.SendLogHandler {
    sendLog(logUrl, message) {
        return new Promise((resolve, reject) => {
            needle__default["default"].post(logUrl, message, {
                json: true,
                compressed: true,
                timeout: 20000,
                headers: {
                    'X-HASH': message.Hash,
                    'X-TOKEN': message.Token,
                },
            }, (err, response) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve({
                    statusCode: response.statusCode,
                });
            });
        });
    }
}

exports.SendLogHandlerNode = SendLogHandlerNode;
