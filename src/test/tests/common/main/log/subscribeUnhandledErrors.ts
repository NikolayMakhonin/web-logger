/* eslint-disable quotes,no-eval */
import {subscribeUnhandledErrors} from '../../../../../main/common/log/subscribeUnhandledErrors'
import {delay} from '../../../../../main/common/log/delay'

describe('common > main > subscribeUnhandledErrors', function () {
	let unhandledErrors = []
	let consoleErrors = []
	let evalErrors = []
	let logs = []

	function assertErrors(check: {
		unhandledErrors?: string[][],
		evalErrors?: string[][],
		consoleErrors?: string[][],
		logs?: string[],
	} = {}) {
		assert.deepStrictEqual(unhandledErrors, check.unhandledErrors || [])
		assert.deepStrictEqual(consoleErrors, check.consoleErrors || [])
		assert.deepStrictEqual(evalErrors, check.evalErrors || [])
		assert.deepStrictEqual(logs, check.logs || [])

		unhandledErrors = []
		consoleErrors = []
		evalErrors = []
		logs = []
	}

	const errorGenerators = [
		{
			func: () => {
				eval(`throw 'Test Error'`)
			},
			check: {
				unhandledErrors: [['Test Error', `throw 'Test Error'`]],
				logs           : [`Unhandled Error Detected: "Test Error"\n"throw 'Test Error'"`],
			},
		},
		// async () => {
		// 	await delay(1)
		// 	throw 'Test Error'
		// },
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

			try {
				errorGenerator.func()
				await delay(100)
			} catch {
			}

			unsubscribe()

			assertErrors(errorGenerator.check)

			try {
				errorGenerator.func()
				await delay(100)
			} catch {
			}

			assertErrors()
		}
	})
})
