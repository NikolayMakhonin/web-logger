import {globalScope} from '../globalScope'

function prepareArgs(args: any[]) {
  return args.map(arg => {
    if (typeof PromiseRejectionEvent !== 'undefined' && arg instanceof PromiseRejectionEvent) {
      return arg.reason || arg
    }

    if (
      typeof Event !== 'undefined' && typeof Element !== 'undefined'
			&& arg instanceof Event
			&& arg.target instanceof Element
    ) {
      if ('src' in arg.target) {
        return `Error load: ${(arg.target as any).src}\r\n${(arg.target as Element).outerHTML}`
      }
    }

    return arg.reason || arg
  })
}

export type TErrorHandler = (...args: any[]) => void

export function catchUnhandledErrors(errorHandler: TErrorHandler) {
  let handled = false

  function handlerFactory(message: string) {
    return (...args: any[]) => {
      if (handled) {
        return
      }

      handled = true
      setTimeout(() => { handled = false })
      errorHandler(message, ...prepareArgs(args))
    }
  }

  const processUnhandledRejectionHandler = handlerFactory('process.unhandledRejection')
  const processUncaughtExceptionHandler = handlerFactory('process.uncaughtException')
  const unhandledrejectionHandler = handlerFactory('unhandledrejection')
  const unhandledErrorHandler = handlerFactory('unhandled error')

  if (typeof process !== 'undefined' && process.on) {
    process
      .on('unhandledRejection', processUnhandledRejectionHandler)
      .on('uncaughtException', processUncaughtExceptionHandler)
  }

  if (typeof globalScope !== 'undefined') {
    if (globalScope.addEventListener) {
      globalScope.addEventListener('unhandledrejection', unhandledrejectionHandler)
      globalScope.onunhandledrejection = unhandledrejectionHandler
      // see: https://stackoverflow.com/a/28771916/5221762
      globalScope.addEventListener('error', unhandledErrorHandler, true)
      globalScope.onerror = unhandledErrorHandler
    }
  }

  return () => {
    if (typeof process !== 'undefined' && process.removeListener) {
      process
        .removeListener('unhandledRejection', processUnhandledRejectionHandler)
        .removeListener('uncaughtException', processUncaughtExceptionHandler)
    }

    if (typeof globalScope !== 'undefined') {
      if (globalScope.removeEventListener) {
        globalScope.removeEventListener('unhandledrejection', unhandledrejectionHandler)
        globalScope.onunhandledrejection = null
        globalScope.onerror = null
      }
    }
  }
}
