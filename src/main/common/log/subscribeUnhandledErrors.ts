/* eslint-disable multiline-ternary,@typescript-eslint/no-shadow */
import {globalScope} from './globalScope'
import {objectToString} from './objectToString'
import {catchUnhandledErrors} from './intercept/catchUnhandledErrors'
import {interceptConsole, consoleOrig, TConsoleHandlerFactory} from './intercept/interceptConsole'
import {catchEvalErrors} from './intercept/interceptEval'

export function subscribeUnhandledErrors({
	catchUnhandled = true,
	catchEval = true,
	catchConsoleLevels = ['error'],
	alert: _alert = true,
	maxLogLength = 2048,
	customLog,
}: {
	catchUnhandled?: boolean | ((...args: any[]) => boolean|void),
	catchEval?: boolean | ((...args: any[]) => boolean|void),
	catchConsoleLevels?: string[] | TConsoleHandlerFactory,
	alert?: boolean,
	maxLogLength?: number,
	customLog?: (log: string) => boolean|void,
} = {}) {
	const unsubscribers = []

	if (catchUnhandled) {
		unsubscribers.push(catchUnhandledErrors((...args) => {
			if (typeof catchUnhandled === 'function' && catchUnhandled(...args)) {
				return
			}

			if (catchUnhandled) {
				errorHandler(...args)
			}
		}))
	}

	if (catchConsoleLevels && catchConsoleLevels.length > 0) {
		unsubscribers.push(interceptConsole((level, handlerOrig) => {
			let handler
			if (typeof catchConsoleLevels === 'function') {
				handler = catchConsoleLevels(level, handlerOrig)
			}

			return (...args: any[]) => {
				if (handler && handler(...args)) {
					return
				}

				if (catchConsoleLevels) {
					errorHandler(...args)
				}
			}
		}))
	}

	if (catchEval) {
		unsubscribers.push(catchEvalErrors((...args: any[]) => {
			if (typeof catchEval === 'function' && catchEval(...args)) {
				return
			}

			if (catchEval) {
				errorHandler(...args)
			}
		}))
	}

	function errorHandler(...args) {
		let log = 'Unhandled Error Detected: ' + args
			.map(o => objectToString(o))
			.join('\n')

		if (maxLogLength && log.length > maxLogLength) {
			log = log.substring(0, maxLogLength - 3) + '...'
		}

		if (customLog && customLog(log)) {
			return
		}

		if (_alert && globalScope.alert) {
			globalScope.alert(log)
		}

		consoleOrig.error(log)
	}

	return function unsubscribe() {
		for (let i = 0, len = unsubscribers.length; i < len; i++) {
			unsubscribers[i]()
		}
	}
}
