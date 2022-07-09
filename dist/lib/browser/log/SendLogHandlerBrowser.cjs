'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var common_log_SendLogHandler = require('../../common/log/SendLogHandler.cjs');
var common_log_globalScope = require('../../common/log/globalScope.cjs');
require('tslib');
require('../../common/log/contracts.cjs');
require('../../common/log/delay.cjs');
require('../../common/log/helpers.cjs');
require('../../common/log/spark-md5.cjs');
require('../../common/log/LogHandler.cjs');

function sendXhr(logUrl, message, selfError) {
    return new Promise((resolve, reject) => {
        // construct an HTTP request
        const xhr = new XMLHttpRequest();
        xhr.onerror = (...args) => {
            selfError(...args);
        };
        xhr.open('POST', logUrl, true);
        xhr.timeout = 20000;
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.setRequestHeader('X-HASH', message.Hash);
        xhr.setRequestHeader('X-TOKEN', message.Token);
        // xhr.setRequestHeader('Accept-Encoding', 'gzip, deflate')
        // xhr.setRequestHeader('Content-Encoding', 'gzip')
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                resolve({
                    statusCode: xhr.status,
                });
            }
        };
        xhr.send(JSON.stringify(message));
    });
}
function sendFetch(logUrl, message) {
    return fetch(logUrl, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'X-HASH': message.Hash,
            'X-TOKEN': message.Token,
        },
        redirect: 'follow',
        referrer: 'no-referrer',
        body: JSON.stringify(message), // body data type must match "Content-Type" header
    })
        .then(response => ({
        statusCode: response.status,
    }));
}
class SendLogHandlerBrowser extends common_log_SendLogHandler.SendLogHandler {
    sendLog(...args) {
        return typeof common_log_globalScope.globalScope.fetch !== 'undefined'
            ? sendFetch(...args)
            : sendXhr(...args);
    }
}

exports.SendLogHandlerBrowser = SendLogHandlerBrowser;
