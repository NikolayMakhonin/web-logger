import { SendLogHandler } from '../../common/log/SendLogHandler.mjs';
import { globalScope } from '../../common/log/globalScope.mjs';
import 'tslib';
import '../../common/log/contracts.mjs';
import '../../common/log/delay.mjs';
import '../../common/log/helpers.mjs';
import '../../common/log/spark-md5.cjs';
import '../../common/log/LogHandler.mjs';

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
class SendLogHandlerBrowser extends SendLogHandler {
    sendLog(...args) {
        return typeof globalScope.fetch !== 'undefined'
            ? sendFetch(...args)
            : sendXhr(...args);
    }
}

export { SendLogHandlerBrowser };
