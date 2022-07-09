'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function delay(timeMilliseconds) {
    return new Promise(resolve => {
        setTimeout(resolve, timeMilliseconds);
    });
}

exports.delay = delay;
