/* eslint-disable @typescript-eslint/no-loop-func */
import {subscribeUnhandledErrors} from './subscribeUnhandledErrors'
import {delay} from './delay'
import {createTestVariants} from '@flemist/test-variants'
import {CONSOLE_LEVELS, TConsoleLevel} from './intercept/interceptConsole'

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
    // ErrorType.SetTimeout,
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
            eval(`throw new Error('${TEST_ERROR_MESSAGE}')` + (catchEvalType === 'excluded' ? '; "EXCLUDED"' : ''))
          }
          catch (e) {
            // empty
          }
          return
        case ErrorType.PromiseCreateRejected:
          Promise.reject(new Error(TEST_ERROR_MESSAGE))
          return delay(0)
        case ErrorType.PromiseReject:
          new Promise((_, reject) => {
            reject(new Error(TEST_ERROR_MESSAGE))
          })
          return delay(0)
        case ErrorType.PromiseRejectComplex:
          Promise
            .resolve()
            .then(o => {
              throw new Error(TEST_ERROR_MESSAGE)
            })
            .catch(o => {
              throw TEST_ERROR_MESSAGE
            })
            .then(() => {}, o => {
              throw new Error(TEST_ERROR_MESSAGE)
            })
          return delay(0)
        case ErrorType.SetTimeout:
          setTimeout(() => {
            throw new Error(TEST_ERROR_MESSAGE)
          }, 0)
          return delay(1)
        case ErrorType.BrowserNetwork:
          document.body.style.backgroundImage = `url(${TEST_ERROR_MESSAGE})`
          return delay(10)
        default:
          throw new Error('Unknown ErrorType: ' + errorType)
      }
    }

    function getShouldCatchError() {
      switch (errorType) {
        case ErrorType.Console:
          switch (catchConsoleType) {
            case null:
            case 'empty':
            case 'excluded':
              return false
            case 'included':
            case 'all':
              return true
            default:
              throw new Error('Unknown ErrorType: ' + errorType)
          }
        case ErrorType.Eval:
          return catchEvalType === true
        case ErrorType.PromiseCreateRejected:
        case ErrorType.PromiseReject:
        case ErrorType.PromiseRejectComplex:
        case ErrorType.SetTimeout:
        case ErrorType.BrowserNetwork:
          return catchUnhandled
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

    const shouldCatchError = getShouldCatchError()
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
    if (shouldCatchError) {
      if (logs.length !== 1) {
        console.log('logs:\r\n' + logs.join('\r\n'))
        assert.strictEqual(logs.length, 1)
      }
      assert.ok(logs[0].includes(TEST_ERROR_MESSAGE), logs[0])
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
