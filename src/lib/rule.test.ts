// https://vitest.dev/api/expect.html
// https://jestjs.io/docs/expect
import { describe, it, expect } from 'vitest'
import { rules, ruleParser, ruleToString, ruleReversal } from './rules.js'

describe(`./rules.js`, () => {
	it(`rules key sorted?`, () => {
		for (const [key, name] of rules.entries()) {
			const parsed = ruleToString(...ruleParser(key))
			expect(key).toBe(parsed)
		}
	})

	it(`ruleParser`, () => {
		expect(ruleParser('B0/S2')).toStrictEqual([[0], [2], 2])
		expect(ruleParser('B430/S32')).toStrictEqual([[0, 3, 4], [2, 3], 2])
		expect(ruleParser('561/4/8')).toStrictEqual([[4], [1, 5, 6], 8])
		expect(ruleParser('B1/S4/8')).toStrictEqual([[1], [4], 8])
		expect(ruleParser('B1/S4/C8')).toStrictEqual([[1], [4], 8])
		expect(ruleParser('B1/S4/G8')).toStrictEqual([[1], [4], 8])

		expect(() => ruleParser('')).toThrowError()
	})

	it(`ruleString`, () => {
		expect(ruleToString([0], [2], 2)).toStrictEqual('B0/S2')
		expect(ruleToString(...ruleParser('B73/S012684/C18'))).toStrictEqual(
			'B37/S012468/C18',
		)
	})

	it(`ruleReversal`, () => {
		expect(ruleReversal(...ruleParser('B0/S2'))).toStrictEqual(
			ruleParser('B01234578/S01234567'),
		)
	})
})
