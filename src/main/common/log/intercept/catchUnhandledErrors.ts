import {globalScope} from '../globalScope'

function prepareArgs(args: any[]) {
	return args.map(arg => (typeof PromiseRejectionEvent !== 'undefined'
		? arg instanceof PromiseRejectionEvent && arg.reason
		: arg.reason)
		|| arg)
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
