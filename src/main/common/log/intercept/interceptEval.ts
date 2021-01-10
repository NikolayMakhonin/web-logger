import {globalScope} from '../globalScope'

export type TEvalHandler = (str: string, evalOrig: (str: string) => any) => boolean|void
const evalOrig = globalScope.eval.bind(globalScope.eval)
export function interceptEval(handler: TEvalHandler) {
	delete globalScope.eval
	globalScope.eval = str => {
		return handler(str, evalOrig)
	}

	return () => {
		delete globalScope.eval
		globalScope.eval = evalOrig
	}
}

export function catchEvalErrors(errorHandler: (...args: any[]) => void) {
	return interceptEval((str, _evalOrig) => {
		try {
			return _evalOrig.call(globalScope, str)
		} catch (ex) {
			errorHandler('eval error', ex, str)
			throw ex
		}
	})
}
