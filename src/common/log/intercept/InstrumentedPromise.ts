// from: https://github.com/rtsao/browser-unhandled-rejection

/* eslint-disable no-proto */
import {globalScope} from '../globalScope'
import {isNode} from "src/common/helpers/isNode";

export const OriginalPromise = Promise

/**
 * ES5 subclassing is used per:
 * https://github.com/rtsao/browser-unhandled-rejection/issues/1
 * https://kangax.github.io/compat-table/es6/#test-Promise_is_subclassable
 *
 * Adapted from: https://gist.github.com/domenic/8ed6048b187ee8f2ec75
 */
export const InstrumentedPromise = function Promise(resolver) {
  if (!(this instanceof InstrumentedPromise)) {
    throw new TypeError('Cannot call a class as a function')
  }
  const promise: any = new OriginalPromise((resolve, reject) =>
    resolver(resolve, arg => {
      void OriginalPromise
        .resolve()
        .then(() => {
          if (!promise._hasDownstreams) {
            dispatchUnhandledRejectionEvent(promise, arg)
          }
        })
      reject(arg)
    }))
  promise.__proto__ = InstrumentedPromise.prototype
  return promise
}

InstrumentedPromise.__proto__ = OriginalPromise
InstrumentedPromise.prototype.__proto__ = OriginalPromise.prototype

InstrumentedPromise.prototype.then = function then(onFulfilled, onRejected) {
  const next = OriginalPromise.prototype.then.call(this, onFulfilled, onRejected)
  this._hasDownstreams = true
  return next
}

function dispatchUnhandledRejectionEvent(promise, reason) {
  let event
  if (typeof document !== 'undefined' && document.createEvent) {
    event = document.createEvent('Event')
    /**
     * Note: these properties should not be enumerable, which is the default setting
     */
    Object.defineProperties(event, {
      promise: {
        value   : promise,
        writable: false,
      },
      reason: {
        value   : reason,
        writable: false,
      },
    })

    event.initEvent(
      'unhandledrejection', // Define that the event name is 'unhandledrejection'
      false, // PromiseRejectionEvent is not bubbleable
      true, // PromiseRejectionEvent is cancelable
    )
  }
  else {
    event = new Event('unhandledrejection', {
      bubbles   : false,
      cancelable: true,
    })
    /**
     * Note: these properties should not be enumerable, which is the default setting
     */
    Object.defineProperties(event, {
      promise: {
        value   : promise,
        writable: false,
      },
      reason: {
        value   : reason,
        writable: false,
      },
    })
  }

  globalScope.dispatchEvent(event)
}

export const needUnhandledRejectionPolyfill = typeof globalScope.PromiseRejectionEvent !== 'function'
  && typeof globalScope.dispatchEvent === 'function'
  && !isNode
