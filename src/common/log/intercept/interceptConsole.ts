import {globalScope} from '../globalScope'

export type TConsoleLevel = 'debug' | 'info' | 'log' | 'warn' | 'error'
export type TConsoleHandlerFactory = (
  level: TConsoleLevel, handlerOrig: (...args) => void,
) => ((...args: any[]) => boolean|void)|boolean|void
export const CONSOLE_LEVELS: ['debug', 'info', 'log', 'warn', 'error'] =
  Object.freeze(['debug', 'info', 'log', 'warn', 'error']) as any

export const consoleOrig = {
  debug: globalScope.console.debug.bind(globalScope.console),
  info : globalScope.console.info.bind(globalScope.console),
  log  : globalScope.console.log.bind(globalScope.console),
  warn : globalScope.console.warn.bind(globalScope.console),
  error: globalScope.console.error.bind(globalScope.console),
}

export function interceptConsole(
  handlerFactory: TConsoleHandlerFactory,
  levels?: TConsoleLevel[],
) {
  if (!levels) {
    levels = CONSOLE_LEVELS
  }

  for (let i = 0, len = levels.length; i < len; i++) {
    const level = levels[i]

    const handlerOrig = consoleOrig[level]

    const _handler = handlerFactory(level, handlerOrig)
    if (typeof _handler !== 'function' && _handler) {
      continue
    }

    if (_handler) {
      const handler = function handler() {
        if ((_handler as any).apply(globalScope.console, arguments)) {
          return
        }
        handlerOrig.apply(globalScope.console, arguments)
      }

      globalScope.console[level] = handler
    }
  }

  return () => {
    for (let i = 0, len = levels.length; i < len; i++) {
      const level = levels[i]
      globalScope.console[level] = consoleOrig[level]
    }
  }
}
