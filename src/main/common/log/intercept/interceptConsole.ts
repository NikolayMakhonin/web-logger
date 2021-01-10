import {globalScope} from '../globalScope'

export type TConsoleLevel = 'trace' | 'debug' | 'info' | 'log' | 'warn' | 'error'
export type TConsoleHandlerFactory = (
	level: TConsoleLevel, handlerOrig: (...args) => void,
) => (...args: any[]) => boolean|void
export const CONSOLE_LEVELS: ['trace', 'debug', 'info', 'log', 'warn', 'error'] =
	Object.freeze(['trace', 'debug', 'info', 'log', 'warn', 'error']) as any

export const consoleOrig = {
	trace: globalScope.console.trace.bind(globalScope.console),
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
		const handler = () => {
			if (_handler.apply(globalScope.console, arguments)) {
				return
			}
			handlerOrig.apply(globalScope.console, arguments)
		}

		globalScope.console[level] = handler
	}

	return () => {
		for (let i = 0, len = levels.length; i < len; i++) {
			const level = levels[i]
			globalScope.console[level] = consoleOrig[level]
		}
	}
}
