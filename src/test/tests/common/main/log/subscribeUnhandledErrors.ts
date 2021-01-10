/* eslint-disable quotes */
import {subscribeUnhandledErrors} from '../../../../../main/common/log/subscribeUnhandledErrors'
import {globalScope} from '../../../../../main/common/log/globalScope'
import {delay} from '../../../../../main/common/log/delay'

describe('common > main > subscribeUnhandledErrors', function () {
	let unhandledErrors = []
	let consoleErrors = []
	let evalErrors = []
	let logs = []

	type TPattern = string | RegExp | false

	type TCheck = {
		unhandledErrors?: (TPattern[]|TPattern)[],
		evalErrors?: (TPattern[]|TPattern)[],
		consoleErrors?: (TPattern[]|TPattern)[],
		logs?: TPattern[],
	}

	function assertValue(actual: any, expected: any) {
		if (Array.isArray(actual)) {
			for (let i = 0, len = actual.length; i < len; i++) {
				assertValue(actual[i], expected[i])
			}
			return
		}

		if (expected === false) {
			return
		}
		if (typeof expected === 'string') {
			assert.strictEqual(actual, expected)
		} else {
			assert.ok(expected.test(actual), actual)
		}
	}

	function assertErrors(check: TCheck = {}) {
		assertValue(unhandledErrors, check.unhandledErrors || [])
		assertValue(consoleErrors, check.consoleErrors || [])
		assertValue(evalErrors, check.evalErrors || [])
		if (!check.logs) {
			assertValue(logs, [])
		} else {
			for (let i = 0, len = logs.length; i < len; i++) {
				if (typeof check.logs[i] === 'string') {
					assertValue(logs[i], check.logs[i])
				} else {
					(check.logs[i] as RegExp).test(logs[i])
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
				globalScope.eval(`evalErrors.push('eval'); throw 'Test Error'`)
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
				unhandledErrors: [[/[\w\.]*?(unhandledRejection)[\w\.]*?/i, 'Test Error', false]],
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
						return true
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

			try {
				errorGenerator.func()
				await delay(100)
			} catch {
			}

			console.debug('debug')
			console.info('info')
			console.log('log')
			console.warn('warn')

			unsubscribe()

			assertErrors(errorGenerator.checkSubscribed)

			try {
				errorGenerator.func()
				await delay(100)
			} catch {
			}

			assertErrors(errorGenerator.checkUnsubscribed)
		}
	})
})
