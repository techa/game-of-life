// https://vitest.dev/api/expect.html
// https://jestjs.io/docs/expect
import { describe, it, expect } from 'vitest'
import { PaintCells } from './PaintCells.js'

describe(`./PaintCells.js`, () => {
	it(`spiral`, () => {
		const narr: number[] = []
		new PaintCells(
			[
				[0, 1, 2],
				[3, 4, 5],
				[6, 7, 8],
				[9, 10, 11],
			],
			0,
		).spiral(4, (val) => {
			narr.push(val)
		})
		expect(narr).toStrictEqual([4, 5, 8, 7, 6, 3, 0, 1, 2, 11, 10, 9])
	})
})
