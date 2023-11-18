// https://vitest.dev/api/expect.html
// https://jestjs.io/docs/expect
import { describe, it, expect } from 'vitest'
import { Array2d } from './Array2d.js'

describe(`./Array2d.js`, () => {
	const arr = new Array2d(5, 5, 1)

	it(`init`, () => {
		expect(arr.get2d()).toStrictEqual([
			[1, 1, 1, 1, 1],
			[1, 1, 1, 1, 1],
			[1, 1, 1, 1, 1],
			[1, 1, 1, 1, 1],
			[1, 1, 1, 1, 1],
		])

		const arr2 = new Array2d(
			[
				[1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1],
			],
			0,
		)

		expect(arr2.initial).toBe(0)
		expect(arr2.get2d()).toStrictEqual([
			[1, 1, 1, 1, 1],
			[1, 1, 1, 1, 1],
			[1, 1, 1, 1, 1],
			[1, 1, 1, 1, 1],
			[1, 1, 1, 1, 1],
		])
	})

	it(`toJSON`, () => {
		expect(JSON.stringify(arr)).toBe(
			'[[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]]',
		)
	})

	it(`toJSON`, () => {
		expect(JSON.stringify(arr)).toBe(
			'[[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]]',
		)
	})
})

describe(`sizings`, () => {
	const arr = new Array2d(5, 4, 1)

	it(`sizing`, () => {
		arr.initial = 0
		expect(arr.sizing(3, 6).get2d()).toStrictEqual([
			[1, 1, 1],
			[1, 1, 1],
			[1, 1, 1],
			[1, 1, 1],
			[0, 0, 0],
			[0, 0, 0],
		])
	})
	it(`addColumns`, () => {
		arr.initial = 2
		expect(arr.addColumns(0).get2d()).toStrictEqual([
			[2, 1, 1, 1],
			[2, 1, 1, 1],
			[2, 1, 1, 1],
			[2, 1, 1, 1],
			[2, 0, 0, 0],
			[2, 0, 0, 0],
		])
	})
	it(`removeColumns`, () => {
		expect(arr.removeColumns().get2d()).toStrictEqual([
			[2, 1, 1],
			[2, 1, 1],
			[2, 1, 1],
			[2, 1, 1],
			[2, 0, 0],
			[2, 0, 0],
		])
	})
	it(`addRows`, () => {
		arr.initial = 3
		expect(arr.addRows().get2d()).toStrictEqual([
			[2, 1, 1],
			[2, 1, 1],
			[2, 1, 1],
			[2, 1, 1],
			[2, 0, 0],
			[2, 0, 0],
			[3, 3, 3],
		])
	})
	it(`removeRows`, () => {
		expect(arr.removeRows(0).removeRows(1).get2d()).toStrictEqual([
			[2, 1, 1],
			[2, 1, 1],
			[2, 0, 0],
			[2, 0, 0],
			[3, 3, 3],
		])
	})

	it(`rotate`, () => {
		expect(arr.rotate().get2d()).toStrictEqual([
			[3, 2, 2, 2, 2],
			[3, 0, 0, 1, 1],
			[3, 0, 0, 1, 1],
		])
		expect(arr.rotate().get2d()).toStrictEqual([
			[3, 3, 3],
			[0, 0, 2],
			[0, 0, 2],
			[1, 1, 2],
			[1, 1, 2],
		])
		expect(arr.rotate().get2d()).toStrictEqual([
			[1, 1, 0, 0, 3],
			[1, 1, 0, 0, 3],
			[2, 2, 2, 2, 3],
		])
		expect(arr.rotate(false).get2d()).toStrictEqual([
			[3, 3, 3],
			[0, 0, 2],
			[0, 0, 2],
			[1, 1, 2],
			[1, 1, 2],
		])
	})
})
