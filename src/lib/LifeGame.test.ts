// https://vitest.dev/api/expect.html
// https://jestjs.io/docs/expect
import { describe, it, expect } from 'vitest'
import { LifeGame } from './LifeGame.js'
import { Array2d } from '../utils/Array2d.js'
import { sleep } from '../utils/Ticker.js'

describe(`./LifeGame.js`, () => {
	it(`step`, () => {
		const life = new LifeGame().init(
			new Array2d([
				[0, 1, 0, 0],
				[0, 1, 1, 0],
				[0, 1, 0, 0],
			]),
		)
		life.step()
		expect(life.cells.get2d()).toStrictEqual([
			[1, 1, 0, 0],
			[1, 1, 1, 0],
			[1, 1, 0, 0],
		])
		life.step()
		expect(life.cells.get2d()).toStrictEqual([
			[0, 0, 0, 0],
			[0, 0, 1, 0],
			[0, 0, 0, 0],
		])
	})
})

describe(`step Generation`, () => {
	const life = new LifeGame().init(
		new Array2d([
			[0, 1, 0, 0],
			[0, 1, 1, 0],
			[0, 1, 0, 0],
		]),
	)
	life.setRule('B23678/S145678/C4')
	it(`step 1`, () => {
		life.step()
		expect(life.cells.get2d()).toStrictEqual([
			[1, 2, 0, 0],
			[1, 2, 2, 0],
			[1, 2, 0, 0],
		])
	})
	it(`step 2`, () => {
		life.step()
		expect(life.cells.get2d()).toStrictEqual([
			[2, 3, 0, 1],
			[2, 3, 3, 1],
			[2, 3, 0, 1],
		])
	})
	it(`step 3`, () => {
		life.step()
		expect(life.cells.get2d()).toStrictEqual([
			[3, 0, 1, 2],
			[3, 0, 0, 2],
			[3, 0, 1, 2],
		])
	})
})

describe(`step Generation & UNDEAD`, () => {
	const life = new LifeGame().init(
		new Array2d([
			[0, 0, -1, 0],
			[0, 0, 0, 0],
			[0, 0, -1, 0],
		]),
	)
	life.setRule('B234/S2/C5')
	it(`step 1`, () => {
		life.step()
		expect(life.cells.get2d()).toStrictEqual([
			[0, 1, -1, 1],
			[0, 1, 1, 1],
			[0, 1, -1, 1],
		])
	})
	it(`step 2`, () => {
		life.step()
		expect(life.cells.get2d()).toStrictEqual([
			[0, 2, -1, 2],
			[0, 2, 2, 2],
			[0, 2, -1, 2],
		])
	})
	it(`step 3`, () => {
		life.step()
		expect(life.cells.get2d()).toStrictEqual([
			[0, 3, -1, 3],
			[0, 3, 3, 3],
			[0, 3, -1, 3],
		])
	})
	it(`step 4`, () => {
		life.step()
		expect(life.cells.get2d()).toStrictEqual([
			[0, 4, -1, 4],
			[0, 4, 4, 4],
			[0, 4, -1, 4],
		])
	})
	it(`step 5`, () => {
		life.step()
		expect(life.cells.get2d()).toStrictEqual([
			[0, 0, -1, 0],
			[0, 0, 0, 0],
			[0, 0, -1, 0],
		])
	})
})

describe('ticker', () => {
	const life = new LifeGame().init(
		new Array2d([
			[0, 0, -1, 0],
			[0, 0, 0, 0],
			[0, 0, -1, 0],
		]),
	)
	life.setRule('B234/S2/C5')

	it(`start`, async () => {
		life.start()
		await sleep(2000)
		life.stop()

		expect(life.cells.get2d()).toStrictEqual(
			life.ticker.count === 18
				? [
						[0, 3, -1, 3],
						[0, 3, 3, 3],
						[0, 3, -1, 3],
				  ]
				: life.ticker.count === 17
				? [
						[0, 2, -1, 2],
						[0, 2, 2, 2],
						[0, 2, -1, 2],
				  ]
				: [
						[0, 1, -1, 1],
						[0, 1, 1, 1],
						[0, 1, -1, 1],
				  ],
		)
	})
})
