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

	it(`getValue(index)`, () => {
		expect(grid.getValue(1)).toBe(1)
		expect(grid.getValue(3)).toBe(254)
		expect(grid.getValue(4)).toBe(255)
	})

	it(`getValue() outside`, () => {
		const grid = new Grid2d({ edgeType: 'loop' }).init([
			[1, 2, 3, 4],
			[6, 7, 8, 9],
			[5, 4, 3, 8],
			[7, 3, 9, 2],
		])

		expect(grid.getValue([1, 1])).toBe(7)
		expect(grid.getValue({ x: 1, y: 2 })).toBe(4)

		// outside x
		expect(grid.getValue([-1, 2])).toBe(8)
		expect(grid.getValue([4, 2])).toBe(5)
		expect(grid.getValue([5, 2])).toBe(4)

		// outside y
		expect(grid.getValue([1, -1])).toBe(3)
		expect(grid.getValue([1, 4])).toBe(2)

		// edgeType no loop
		expect(grid.getValue([1, 4], 0)).toBe(0)
		expect(grid.getValue([1, 4], 1)).toBe(1)
		expect(grid.getValue([1, 4], null)).toBe(null)
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
		const grid = new Grid2d()

		// モック関数でイベントリスナーを監視
		const mockListener = vi.fn()
		grid.onValuesChange(mockListener)

		grid.init([
			[0, 1],
			[2, 3],
		])

		// 値を変更
		grid.setValue(2, 9)

		// イベントが 1 回呼ばれたことを検証
		expect(mockListener).toHaveBeenCalledTimes(1)

		// コールバックに渡された引数を検証
		expect(mockListener).toHaveBeenCalledWith(2, grid.state.values)
	})

	it('should trigger event on full array update', () => {
		const grid = new Grid2d()

		// モック関数でイベントリスナーを監視
		const mockListener = vi.fn()
		grid.onValuesChange(mockListener)

		grid.init([
			[0, 1],
			[2, 3],
		])

		// イベントが 1 回呼ばれたことを検証
		expect(mockListener).toHaveBeenCalledTimes(0)

		// 全体更新
		grid.setValues(new Uint8Array([4, 5, 6, 7]))

		// イベントが 1 回呼ばれたことを検証
		expect(mockListener).toHaveBeenCalledTimes(1)

		// `null` で全体変更イベントを検知
		expect(mockListener).toHaveBeenCalledWith(null, grid.state.values)
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

describe('Grid2d encode decode', () => {
	it('encode', () => {
		const grid = new Grid2d().init([
			[0, 1],
			[2, 3],
		])
		expect(grid.encode()).toBe('2.2.Gw==.2')
	})
	it('decode', () => {
		const grid = new Grid2d()
		expect(grid.init(...grid.decode('2.2.Gw==.2')).get2d()).toStrictEqual([
			[0, 1],
			[2, 3],
		])
	})
	it('encode minus value', () => {
		const grid = new Grid2d().init([
			[0, 1],
			[-1, -2],
		])
		expect(grid.encode()).toBe('2.2.AAH//g==.8')
	})
	it('decode', () => {
		const grid = new Grid2d()
		expect(
			grid.init(...grid.decode('2.2.AAH//g==.8')).get2d(),
		).toStrictEqual([
			[0, 1],
			[255, 254],
		])
	})
})
