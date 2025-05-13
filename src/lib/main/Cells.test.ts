// https://vitest.dev/api/expect.html
// https://jestjs.io/docs/expect
import { describe, it, expect } from 'vitest'
import { Cells } from './Cells.js'

describe(`Grid2d _getModify`, () => {
	let grid = new Cells()

	grid = grid.init([
		[0, 1],
		[-1, -2],
		[255, 254],
		[-3, -4],
	])

	it(`get(index)`, () => {
		expect(grid.getValue(0)).toBe(0)
		expect(grid.getValue(1)).toBe(1)

		expect(grid.getValue(2)).toBe(-1)
		expect(grid.getValue(3)).toBe(-2)

		expect(grid.getValue(4)).toBe(-1)
		expect(grid.getValue(5)).toBe(-2)

		expect(grid.getValue(6)).toBe(253)
		expect(grid.getValue(7)).toBe(252)
	})
})

describe('Cells encode decode', () => {
	it('encode', () => {
		const grid = new Cells().init([
			[0, 1],
			[2, 3],
		])
		expect(grid.encode()).toBe('2.2.Gw==.2')
		grid.setValues(
			new Uint8Array(
				[
					[0, 1],
					[-1, -2],
				].flat(),
			),
		)
		expect(grid.encode()).toBe('2.2.Gw==.2')
	})
	it('decode', () => {
		const grid = new Cells()
		expect(grid.init(...grid.decode('2.2.Gw==.2')).get2d()).toStrictEqual([
			[0, 1],
			[255, 254],
		])
	})
})

describe(`Cell Automaton`, () => {
	it(`glider`, () => {
		const grid = new Cells().init([
			[0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 1, 0, 0],
			[0, 0, 0, 0, 1, 0, 0, 0],
			[0, 0, 0, 0, 1, 1, 1, 0],
			[0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0],
		])
		expect(grid.setValues(grid.next([3], [2, 3])).get2d()).toStrictEqual([
			[0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 1, 0, 1, 0],
			[0, 0, 0, 0, 1, 1, 0, 0],
			[0, 0, 0, 0, 0, 1, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0],
		])
		expect(grid.setValues(grid.next([3], [2, 3])).get2d()).toStrictEqual([
			[0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 1, 0, 0, 0],
			[0, 0, 0, 0, 1, 0, 1, 0],
			[0, 0, 0, 0, 1, 1, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0],
		])
		expect(grid.setValues(grid.next([3], [2, 3])).get2d()).toStrictEqual([
			[0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 1, 0, 0],
			[0, 0, 0, 1, 1, 0, 0, 0],
			[0, 0, 0, 0, 1, 1, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0],
		])
	})
})
