// https://vitest.dev/api/expect.html
// https://jestjs.io/docs/expect
import { describe, it, expect } from 'vitest'
import {
	ruleParser,
	ruleString,
	ruleReversal,
	type RuleString,
} from './rules.js'

describe(`./rules.js`, () => {
	it(`ruleParser`, () => {
		expect(ruleParser('B0/S2')).toStrictEqual([[0], [2], 2])
	})
	it(`ruleParser`, () => {
		expect(ruleParser('B430/S32')).toStrictEqual([[0, 3, 4], [2, 3], 2])
	})

	it(`ruleString`, () => {
		expect(ruleString([0], [2], 2)).toStrictEqual('B0/S2')
		expect(ruleString(...ruleParser('B73/S012684/C18'))).toStrictEqual(
			'B37/S012468/C18',
		)
	})

	it(`ruleReversal`, () => {
		expect(ruleReversal(...ruleParser('B0/S2'))).toStrictEqual(
			ruleParser('B01234578/S01234567'),
		)
	})
})
