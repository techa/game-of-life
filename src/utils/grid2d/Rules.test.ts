// https://vitest.dev/api/expect.html
// https://jestjs.io/docs/expect
import { describe, it, expect } from 'vitest'
import { Rules, rules } from './Rules.js'

describe(`./Rule.js`, () => {
	it(`select`, () => {
		rules.select("Conway's Life")
		expect(rules.name).toBe("Conway's Life")
		expect(rules.born).toStrictEqual([3])
		expect(rules.survival).toStrictEqual([2, 3])
		expect(rules.cycle).toStrictEqual(2)
	})
	it(`parse nameless rule`, () => {
		rules.parse('B34/S45')
		expect(rules.name).toBe('')
		expect(rules.born).toStrictEqual([3, 4])
		expect(rules.survival).toStrictEqual([4, 5])
		expect(rules.cycle).toStrictEqual(2)
	})

	it(`Duplicate rule checking`, () => {
		const results = new Set()

		expect(
			rules.find(({ rule }) => {
				if (results.has(rule)) {
					return true
				} else results.add(rule)
			}),
		).toBe(undefined)
	})
})

describe('Rules sortBy', () => {
	const testRules = new Rules(
		{ name: 'Rule A', rule: 'B3/S23/C5' },
		{ name: 'Rule B', rule: 'B2/S34/C4' },
		{ name: 'Rule C', rule: 'B4/S12/C6' },
		{ name: 'Rule D', rule: 'B5/S345/C3' },
	)

	it('should sort by name (ascending)', () => {
		testRules.sortBy('name')
		expect(testRules.map((r) => r.name)).toEqual([
			'Rule A',
			'Rule B',
			'Rule C',
			'Rule D',
		])
	})

	it('should sort by name (descending)', () => {
		testRules.sortBy('name', false)
		expect(testRules.map((r) => r.name)).toEqual([
			'Rule D',
			'Rule C',
			'Rule B',
			'Rule A',
		])
	})

	it('should sort by born values (ascending)', () => {
		testRules.sortBy('born')
		expect(testRules.map((r) => r.rule)).toEqual([
			'B2/S34/C4',
			'B3/S23/C5',
			'B4/S12/C6',
			'B5/S345/C3',
		])
	})

	it('should sort by survival values (ascending)', () => {
		testRules.sortBy('survival')
		expect(testRules.map((r) => r.rule)).toEqual([
			'B4/S12/C6',
			'B3/S23/C5',
			'B2/S34/C4',
			'B5/S345/C3',
		])
	})

	it('should sort by cycle values (ascending)', () => {
		testRules.sortBy('cycle')
		expect(testRules.map((r) => r.rule)).toEqual([
			'B5/S345/C3',
			'B2/S34/C4',
			'B3/S23/C5',
			'B4/S12/C6',
		])
	})
})

describe(`Rules reversal`, () => {
	it(`B0/S2`, () => {
		const testRules = new Rules()
		testRules.parse('B0/S2')
		testRules.reversal()
		expect(testRules.toString()).toBe('B01234578/S01234567')
	})
})
