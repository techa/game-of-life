// https://vitest.dev/api/expect.html
// https://jestjs.io/docs/expect
import { describe, it, expect, vi } from 'vitest'
import { Grid2d } from './Grid2d.js'

describe(`./Grid2d.js`, () => {
	let grid = new Grid2d()

	grid = grid.init([
		[0, 1],
		[-1, -2],
		[255, 254],
	])

	it(`get(index)`, () => {
		expect(grid.get(1)).toBe(1)
		expect(grid.get(3)).toBe(254)
		expect(grid.get(4)).toBe(255)
	})

	it(`get() outside`, () => {
		const grid = new Grid2d({ edgeType: 'loop' }).init([
			[1, 2, 3, 4],
			[6, 7, 8, 9],
			[5, 4, 3, 8],
			[7, 3, 9, 2],
		])

		expect(grid.get([1, 1])).toBe(7)
		expect(grid.get({ x: 1, y: 2 })).toBe(4)

		// outside x
		expect(grid.get([-1, 2])).toBe(8)
		expect(grid.get([4, 2])).toBe(5)
		expect(grid.get([5, 2])).toBe(4)

		// outside y
		expect(grid.get([1, -1])).toBe(3)
		expect(grid.get([1, 4])).toBe(2)

		// edgeType no loop
		expect(grid.get([1, 4], 0)).toBe(0)
		expect(grid.get([1, 4], 1)).toBe(1)
		expect(grid.get([1, 4], null)).toBe(null)
	})

	it(`get2d()`, () => {
		expect(grid.get2d()).toStrictEqual([
			[0, 1],
			[255, 254],
			[255, 254],
		])
	})

	it(`rotate()`, () => {
		expect(grid.rotate().get2d()).toStrictEqual([
			[255, 255, 0],
			[254, 254, 1],
		])
		expect(grid.rotate(false).get2d()).toStrictEqual([
			[0, 1],
			[255, 254],
			[255, 254],
		])
		expect(grid.rotate(false).get2d()).toStrictEqual([
			[1, 254, 254],
			[0, 255, 255],
		])
	})

	it(`each`, () => {
		const grid = new Grid2d().init([
			[0, 1],
			[2, 0],
		])
		expect(grid.each((v) => (!v ? 5 : v)).get2d()).toStrictEqual([
			[5, 1],
			[2, 5],
		])
	})
})

describe('Grid2d Events', () => {
	it('should trigger event on individual value update', () => {
		const grid = new Grid2d().init([
			[0, 1],
			[2, 3],
		])

		// モック関数でイベントリスナーを監視
		const mockListener = vi.fn()
		grid.onValuesChange(mockListener)

		// 値を変更
		grid.setValue(2, 9)

		// イベントが 1 回呼ばれたことを検証
		expect(mockListener).toHaveBeenCalledTimes(1)

		// コールバックに渡された引数を検証
		expect(mockListener).toHaveBeenCalledWith(2, grid._values)
	})

	it('should trigger event on full array update', () => {
		const grid = new Grid2d().init([
			[0, 1],
			[2, 3],
		])

		const mockListener = vi.fn()
		grid.onValuesChange(mockListener)

		// 全体更新
		grid.setValues(new Uint8Array([4, 5, 6, 7]))

		// イベントが 1 回呼ばれたことを検証
		expect(mockListener).toHaveBeenCalledTimes(1)

		// `null` で全体変更イベントを検知
		expect(mockListener).toHaveBeenCalledWith(null, grid._values)
	})
})

describe('Grid2d sizeing', () => {
	it('sizing', () => {
		const grid = new Grid2d().init([
			[1, 2, 3, 4],
			[6, 7, 8, 9],
			[5, 4, 3, 8],
			[7, 3, 9, 2],
		])

		expect(grid.sizing(5, 5).get2d()).toStrictEqual([
			[1, 2, 3, 4, 0],
			[6, 7, 8, 9, 0],
			[5, 4, 3, 8, 0],
			[7, 3, 9, 2, 0],
			[0, 0, 0, 0, 0],
		])
		expect(grid.sizing(6, 6, true, true).get2d()).toStrictEqual([
			[0, 0, 0, 0, 0, 0],
			[0, 1, 2, 3, 4, 0],
			[0, 6, 7, 8, 9, 0],
			[0, 5, 4, 3, 8, 0],
			[0, 7, 3, 9, 2, 0],
			[0, 0, 0, 0, 0, 0],
		])
		expect(grid.sizing(5, 5, true, false).get2d()).toStrictEqual([
			[0, 1, 2, 3, 4],
			[0, 6, 7, 8, 9],
			[0, 5, 4, 3, 8],
			[0, 7, 3, 9, 2],
			[0, 0, 0, 0, 0],
		])
		expect(grid.sizing(4, 4, false, true).get2d()).toStrictEqual([
			[1, 2, 3, 4],
			[6, 7, 8, 9],
			[5, 4, 3, 8],
			[7, 3, 9, 2],
		])
	})
})

describe('Grid2d insert', () => {
	it('expand', () => {
		const grid = new Grid2d().init([[0]])
		expect(grid.insert(2, 2, [0, 1, 2, 3]).get2d()).toStrictEqual([
			[0, 1],
			[2, 3],
		])
		expect(grid.clear().get2d()).toStrictEqual([
			[0, 0],
			[0, 0],
		])
	})
	it('insert center', () => {
		const grid = new Grid2d().init(8, 8)
		expect(grid.insert(2, 2, [0, 1, 2, 3]).get2d()).toStrictEqual([
			[0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 1, 0, 0, 0],
			[0, 0, 0, 2, 3, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0],
		])
	})
})
