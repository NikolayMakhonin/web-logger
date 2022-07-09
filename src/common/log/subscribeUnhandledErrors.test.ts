/* eslint-disable @typescript-eslint/no-loop-func */
import {subscribeUnhandledErrors} from './subscribeUnhandledErrors'
import {delay} from './delay'
import {createTestVariants} from '@flemist/test-variants'
import {CONSOLE_LEVELS, TConsoleLevel} from './intercept/interceptConsole'
import {globalScope} from './globalScope'

async function runWithDisabledOnError<T>(func: () => Promise<T>|T): Promise<T> {
  if (!globalScope?.onerror) {
    return func()
  }

  const prevOnError = globalScope.onerror
  globalScope.onerror = null
  try {
    return await func()
  }
  finally {
    globalScope.onerror = prevOnError
  }
}

describe('common > main > subscribeUnhandledErrors', function () {
  enum ErrorType {
    Console = 'Console',
    Eval = 'Eval',
    PromiseCreateRejected = 'PromiseCreateRejected',
    PromiseReject = 'PromiseReject',
    PromiseRejectComplex = 'PromiseRejectComplex',
    SetTimeout = 'SetTimeout',
    BrowserNetwork = 'BrowserNetwork',
  }

  let errorTypes = [
    ErrorType.Console,
    ErrorType.Eval,
    // ErrorType.PromiseCreateRejected,
    // ErrorType.PromiseReject,
    // ErrorType.PromiseRejectComplex,
    ErrorType.SetTimeout,
    // ErrorType.BrowserNetwork,
  ]
  if (typeof window === 'undefined') {
    errorTypes = errorTypes.filter(o => {
      return o !== ErrorType.BrowserNetwork
        && o !== ErrorType.SetTimeout
    })
  }

  type CatchConsoleType = null | 'empty' | 'excluded' | 'included' | 'all'

  const testVariants = createTestVariants(async ({
    catchUnhandled,
    catchEvalType,
    errorType,
    catchConsoleType,
    consoleErrorLevel,
  }: {
    catchUnhandled: boolean,
    catchEvalType: boolean | 'excluded',
    errorType: ErrorType,
    catchConsoleType: CatchConsoleType,
    consoleErrorLevel: TConsoleLevel,
  }) => {
    const TEST_ERROR_MESSAGE = errorType
      + (consoleErrorLevel ? '.' + consoleErrorLevel : '')
      + ': TEST ERROR'

    function createError() {
      function TEST_THROW() {
        return new Error(TEST_ERROR_MESSAGE)
      }
      return TEST_THROW()
    }

    function filterEval(str: string) {
      return !str.includes('EXCLUDED')
    }

    async function generateError() {
      switch (errorType) {
        case ErrorType.Console:
          switch (consoleErrorLevel) {
            case 'debug':
              console.debug(TEST_ERROR_MESSAGE)
              return
            case 'log':
              console.log(TEST_ERROR_MESSAGE)
              return
            case 'info':
              console.info(TEST_ERROR_MESSAGE)
              return
            case 'warn':
              console.warn(TEST_ERROR_MESSAGE)
              return
            case 'error':
              console.error(TEST_ERROR_MESSAGE)
              return
            default:
              throw new Error('Unknown ErrorType: ' + errorType)
          }
        case ErrorType.Eval:
          try {
            eval(`(function TEST_THROW() { throw new Error('${TEST_ERROR_MESSAGE}') })()` + (catchEvalType === 'excluded' ? '; "EXCLUDED"' : ''))
          }
          catch (e) {
            // empty
          }
          return
        case ErrorType.PromiseCreateRejected:
          Promise.reject(createError())
          return delay(0)
        case ErrorType.PromiseReject:
          new Promise((_, reject) => {
            reject(createError())
          })
          return delay(0)
        case ErrorType.PromiseRejectComplex:
          Promise
            .resolve()
            .then(o => {
              throw createError()
            })
            .catch(o => {
              throw o
            })
            .then(() => {}, o => {
              throw o
            })
          return delay(0)
        case ErrorType.SetTimeout:
          if (catchUnhandled) {
            setTimeout(() => {
              throw createError()
            }, 0)
            return delay(1)
          }
          else {
            return runWithDisabledOnError(() => {
              setTimeout(() => {
                throw createError()
              }, 0)
              return delay(1)
            })
          }
        case ErrorType.BrowserNetwork:
          document.body.style.backgroundImage = `url(${TEST_ERROR_MESSAGE})`
          return delay(10)
        default:
          throw new Error('Unknown ErrorType: ' + errorType)
      }
    }

    type ExpectedBehavior = {
      catchError: boolean,
      hasStackTrace: boolean,
    }

    function getExpectedBehavior(): ExpectedBehavior {
      switch (errorType) {
        case ErrorType.Console:
          switch (catchConsoleType) {
            case null:
            case 'empty':
            case 'excluded':
              return {
                catchError   : false,
                hasStackTrace: false,
              }
            case 'included':
            case 'all':
              return {
                catchError   : true,
                hasStackTrace: false,
              }
            default:
              throw new Error('Unknown ErrorType: ' + errorType)
          }
        case ErrorType.Eval:
          return {
            catchError   : catchEvalType === true,
            hasStackTrace: true,
          }
        case ErrorType.PromiseCreateRejected:
        case ErrorType.PromiseReject:
        case ErrorType.PromiseRejectComplex:
        case ErrorType.SetTimeout:
          return {
            catchError   : catchUnhandled,
            hasStackTrace: true,
          }
        case ErrorType.BrowserNetwork:
          return {
            catchError   : catchUnhandled,
            hasStackTrace: false,
          }
        default:
          throw new Error('Unknown ErrorType: ' + errorType)
      }
    }

    function getCatchConsoleLevels() {
      switch (catchConsoleType) {
        case null:
          return null
        case 'empty':
          return []
        case 'excluded':
          return CONSOLE_LEVELS.filter(o => o !== consoleErrorLevel)
        case 'included':
          return [consoleErrorLevel]
        case 'all':
          return CONSOLE_LEVELS.slice()
        default:
          throw new Error('Unknown CatchConsoleType: ' + catchConsoleType)
      }
    }

    const expectedBehavior = getExpectedBehavior()
    const catchConsoleLevels = getCatchConsoleLevels()
    const logs: string[] = []

    const unsubscribe = subscribeUnhandledErrors({
      catchUnhandled,
      catchEval: !!catchEvalType,
      catchConsoleLevels,
      filterEval,
      // alert: false,
      // maxLogLength,
      customLog(log) {
        logs.push(log + '')
        return true
      },
    })

    await generateError()

    // check
    if (expectedBehavior.catchError) {
      if (logs.length !== 1) {
        console.log('logs:\r\n' + logs.join('\r\n'))
        assert.strictEqual(logs.length, 1)
      }
      assert.ok(logs[0].includes(TEST_ERROR_MESSAGE), logs[0])
      assert.strictEqual(
        logs[0].includes('TEST_THROW'),
        expectedBehavior.hasStackTrace,
        logs[0],
      )
      logs.length = 0
    }
    else {
      assert.deepStrictEqual(logs, [])
    }

    unsubscribe()

    await generateError()
    assert.deepStrictEqual(logs, [])
  })

  it('variants', async function () {
    this.timeout(60000)

    // window.onerror = null

    // setTimeout(() => {
    //   throw new Error()
    // }, 10)
    //
    // return delay(1000)

    await testVariants({
      catchUnhandled   : [false, true],
      catchEvalType    : [false, true, 'excluded'],
      catchConsoleType : [null, 'empty', 'excluded', 'included', 'all'],
      errorType        : errorTypes,
      consoleErrorLevel: ({errorType}) => errorType === ErrorType.Console
        ? ['debug', 'info', 'log', 'warn', 'error']
        : [null],
    })()
  })
})

// describe('common > main > subscribeUnhandledErrors old', function () {
//   let unhandledErrors = []
//   let consoleErrors = []
//   let evalErrors = []
//   let logs = []
//
//   type TPattern = string | RegExp | false
//
//   type TCheck = {
//     unhandledErrors?: (TPattern[]|TPattern)[],
//     evalErrors?: (TPattern[]|TPattern)[],
//     consoleErrors?: (TPattern[]|TPattern)[],
//     logs?: TPattern[],
//   }
//
//   function assertValue(actual: any, expected: any) {
//     if (Array.isArray(actual)) {
//       for (let i = 0, len = actual.length; i < len; i++) {
//         assertValue(actual[i], expected[i])
//       }
//       return
//     }
//
//     if (expected === false) {
//       return
//     }
//     if (typeof expected === 'string') {
//       assert.strictEqual(actual, expected)
//     }
//     else {
//       assert.ok(expected.test(actual), actual)
//     }
//   }
//
//   function assertErrors(check: TCheck = {}) {
//     assertValue(unhandledErrors, check.unhandledErrors || [])
//     assertValue(consoleErrors, check.consoleErrors || [])
//     assertValue(evalErrors, check.evalErrors || [])
//     if (!check.logs) {
//       assertValue(logs, [])
//     }
//     else {
//       for (let i = 0, len = logs.length; i < len; i++) {
//         if (typeof check.logs[i] === 'string') {
//           assertValue(logs[i], check.logs[i])
//         }
//         else {
//           (check.logs[i] as RegExp).test(logs[i])
//         }
//       }
//     }
//
//     unhandledErrors = []
//     consoleErrors = []
//     evalErrors = []
//     logs = []
//   }
//
//   const errorGenerators: Array<{
//     func: () => void,
//     checkSubscribed?: TCheck,
//     checkUnsubscribed?: TCheck,
//   }> = [
//     {
//       func: () => {
//         globalScope.evalErrors = evalErrors
//         globalScope.eval(`evalErrors.push('eval'); throw 'Test Error'`)
//       },
//       checkSubscribed: {
//         evalErrors: ['eval', ['eval error', 'Test Error', `evalErrors.push('eval'); throw 'Test Error'`]],
//         logs      : [`"eval error"\n"Test Error"\n"evalErrors.push('eval'); throw 'Test Error'"`],
//       },
//       checkUnsubscribed: {
//         evalErrors: ['eval'],
//       },
//     },
//     {
//       func: () => {
//         console.error('Test Error')
//       },
//       checkSubscribed: {
//         consoleErrors: [['Test Error']],
//         logs         : [`"console error"\n"Test Error"`],
//       },
//       checkUnsubscribed: {
//       },
//     },
//     {
//       func: async () => {
//         await delay(1)
//         throw 'Test Error'
//       },
//       checkSubscribed: {
//         unhandledErrors: [[/[\w.]*?(unhandledRejection)[\w.]*?/i, 'Test Error', false]],
//         logs           : [/"([\w.]*?(unhandled|uncaught)[\w.]*?)"\n"Test Error"/],
//       },
//       checkUnsubscribed: {
//       },
//     },
//   ]
//
//   it('eval', async function () {
//     // Test subscribe unsubscribe
//     subscribeUnhandledErrors()()
//
//     for (let i = 0, len = errorGenerators.length; i < len; i++) {
//       const errorGenerator = errorGenerators[i]
//
//       const unsubscribe = subscribeUnhandledErrors({
//         catchUnhandled(...args) {
//           unhandledErrors.push(args)
//         },
//         catchConsoleLevels(level, handlerOrig) {
//           if (level !== 'error') {
//             return true
//           }
//           return (...args) => {
//             consoleErrors.push(args)
//           }
//         },
//         catchEval(...args) {
//           evalErrors.push(args)
//         },
//         customLog(log) {
//           logs.push(log)
//         },
//       })
//
//       try {
//         errorGenerator.func()
//         await delay(100)
//       }
//       catch {
//       }
//
//       console.debug('debug')
//       console.info('info')
//       console.log('log')
//       console.warn('warn')
//
//       unsubscribe()
//
//       assertErrors(errorGenerator.checkSubscribed)
//
//       try {
//         errorGenerator.func()
//         await delay(100)
//       }
//       catch {
//       }
//
//       assertErrors(errorGenerator.checkUnsubscribed)
//     }
//   })
// })
