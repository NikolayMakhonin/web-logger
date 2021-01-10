/* eslint-disable quotes,no-eval */
import {subscribeUnhandledErrors} from '../../../../../main/common/log/subscribeUnhandledErrors'
import {globalScope} from '../../../../../main/common/log/globalScope'
import {delay} from '../../../../../main/common/log/delay'

describe('common > main > subscribeUnhandledErrors', function () {
	let unhandledErrors = []
	let consoleErrors = []
	let evalErrors = []
	let logs = []

	type TCheck = {
		unhandledErrors?: (string[]|string)[],
		evalErrors?: (string[]|string)[],
		consoleErrors?: (string[]|string)[],
		logs?: (string|RegExp)[],
	}

	function assertErrors(check: TCheck = {}) {
		assert.deepStrictEqual(unhandledErrors, check.unhandledErrors || [])
		assert.deepStrictEqual(consoleErrors, check.consoleErrors || [])
		assert.deepStrictEqual(evalErrors, check.evalErrors || [])
		if (!check.logs) {
			assert.deepStrictEqual(logs, [])
		} else {
			for (let i = 0, len = logs.length; i < len; i++) {
				if (typeof check.logs[i] === 'string') {
					assert.strictEqual(logs[i], check.logs[i])
				} else {
					;(check.logs[i] as RegExp).test(logs[i])
				}
			}
		}

		unhandledErrors = []
		consoleErrors = []
		evalErrors = []
		logs = []
	}

	const errorGenerators: Array<{
		func: () => void,
		checkSubscribed?: TCheck,
		checkUnsubscribed?: TCheck,
	}> = [
		{
			func: () => {
				globalScope.evalErrors = evalErrors
				eval(`evalErrors.push('eval'); throw 'Test Error'`)
			},
			checkSubscribed: {
				evalErrors: ['eval', ['eval error', 'Test Error', `evalErrors.push('eval'); throw 'Test Error'`]],
				logs      : [`"eval error"\n"Test Error"\n"evalErrors.push('eval'); throw 'Test Error'"`],
			},
			checkUnsubscribed: {
				evalErrors: ['eval'],
			},
		},
		{
			func: () => {
				console.error('Test Error')
			},
			checkSubscribed: {
				consoleErrors: [['Test Error']],
				logs      : [`"console error"\n"Test Error"`],
			},
			checkUnsubscribed: {
			},
		},
		{
			func: async () => {
				await delay(1)
				throw 'Test Error'
			},
			checkSubscribed: {
				unhandledErrors: [['process.unhandledRejection', 'Test Error']],
				logs      : [/"([\w\.]*?(unhandled|uncaught)[\w\.]*?)"\n"Test Error"/],
			},
			checkUnsubscribed: {
			},
		},
	]

	it('eval', async function () {
		// Test subscribe unsubscribe
		subscribeUnhandledErrors()()

		for (let i = 0, len = errorGenerators.length; i < len; i++) {
			const errorGenerator = errorGenerators[i]

			const unsubscribe = subscribeUnhandledErrors({
				catchUnhandled(...args) {
					unhandledErrors.push(args)
				},
				catchConsoleLevels(level, handlerOrig) {
					if (level !== 'error') {
						return
					}
					return (...args) => {
						consoleErrors.push(args)
					}
				},
				catchEval(...args) {
					evalErrors.push(args)
				},
				customLog(log) {
					logs.push(log)
				},
			})

			let promise
			try {
				promise = errorGenerator.func()
				await delay(100)
			} catch {
			}

			unsubscribe()

			assertErrors(promise
				? {
					...errorGenerator.checkSubscribed,
					unhandledErrors: errorGenerator.checkSubscribed.unhandledErrors.map(o => {
						return [...o, promise]
					}),
				}
				: errorGenerator.checkSubscribed)

			try {
				errorGenerator.func()
				await delay(100)
			} catch {
			}

			assertErrors(errorGenerator.checkUnsubscribed)
		}
	})
})
