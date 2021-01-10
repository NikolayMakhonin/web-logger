import {globalScope} from '../globalScope'

function prepareArgs(args: any[]) {
	return args.map(arg => (typeof PromiseRejectionEvent !== 'undefined'
		? arg instanceof PromiseRejectionEvent && arg.reason
		: arg.reason)
		|| arg)
}

export type TErrorHandler = (...args: any[]) => void

export function catchUnhandledErrors(errorHandler: TErrorHandler) {
	const processUnhandledRejectionHandler = (...args: any[]) => {
		errorHandler('process.unhandledRejection', ...prepareArgs(args))
	}

	const processUncaughtExceptionHandler = (...args: any[]) => {
		errorHandler('process.uncaughtException', ...prepareArgs(args))
	}

	const unhandledrejectionHandler = (...args: any[]) => {
		errorHandler('unhandledrejection', ...prepareArgs(args))
	}

	const unhandledErrorHandler = (...args: any[]) => {
		errorHandler('unhandled error', ...prepareArgs(args))
	}

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
