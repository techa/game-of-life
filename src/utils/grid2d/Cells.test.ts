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
		expect(grid.get(0)).toBe(0)
		expect(grid.get(1)).toBe(1)

		expect(grid.get(2)).toBe(-1)
		expect(grid.get(3)).toBe(-2)

		expect(grid.get(4)).toBe(-1)
		expect(grid.get(5)).toBe(-2)

		expect(grid.get(6)).toBe(253)
		expect(grid.get(7)).toBe(252)
	})
})

describe('Grid2d encode decode', () => {
	it('encode', () => {
		const grid = new Cells().init([
			[0, 1],
			[2, 3],
		])
		expect(grid.encode()).toBe('2.2.Gw==.2')
		grid.init([
			[0, 1],
			[-1, -2],
		])
		expect(grid.encode()).toBe('2.2.Gw==.2')
	})
	it('decode', () => {
		const grid = new Cells()
		expect(grid.init(...grid.decode('2.2.Gw==.2')).get2d()).toStrictEqual([
			[0, 1],
			[2, 3],
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
		expect(grid.init(grid.next([3], [2, 3])).get2d()).toStrictEqual([
			[0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 1, 0, 1, 0],
			[0, 0, 0, 0, 1, 1, 0, 0],
			[0, 0, 0, 0, 0, 1, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0],
		])
		expect(grid.init(grid.next([3], [2, 3])).get2d()).toStrictEqual([
			[0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 1, 0, 0, 0],
			[0, 0, 0, 0, 1, 0, 1, 0],
			[0, 0, 0, 0, 1, 1, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0],
		])
		expect(grid.init(grid.next([3], [2, 3])).get2d()).toStrictEqual([
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
