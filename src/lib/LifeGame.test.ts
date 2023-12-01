// https://vitest.dev/api/expect.html
// https://jestjs.io/docs/expect
import { describe, it, expect } from 'vitest'
import { LifeGame } from './LifeGame.js'
import { sleep } from '../utils/Ticker.js'
import type { RuleString } from './rules.js'

describe(`./LifeGame.js`, () => {
	const life = new LifeGame().init([
		[0, 1, 0, 0],
		[0, 1, 1, 0],
		[0, 1, 0, 0],
	])

	it(`setRule reversal`, () => {
		expect(life.setRule('B3/S23', true)).toBe('B0123478/S01234678')
	})

	it(`setRule error`, () => {
		expect(life.setRule('B5/65/7' as RuleString)).toBe('B0123478/S01234678')
	})

	it(`setRule set`, () => {
		expect(life.setRule('B3/S23/2')).toBe('B3/S23')
	})

	it(`step 1`, () => {
		life.step()
		expect(life.cells.get2d()).toStrictEqual([
			[1, 1, 0, 0],
			[1, 1, 1, 0],
			[1, 1, 0, 0],
		])
		expect(life.generation).toBe(1)
		expect(life.population).toBe(7)
	})

	it(`step 2`, () => {
		life.step()
		expect(life.cells.get2d()).toStrictEqual([
			[0, 0, 0, 0],
			[0, 0, 1, 0],
			[0, 0, 0, 0],
		])
		expect(life.generation).toBe(2)
		expect(life.population).toBe(1)
	})
})

describe(`step Generation`, () => {
	const life = new LifeGame().init([
		[0, 1, 0, 0],
		[0, 1, 1, 0],
		[0, 1, 0, 0],
	])
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
		expect(life.canStep).toBe(true)
		expect(life.cells.get2d()).toStrictEqual([
			[3, 0, 1, 2],
			[3, 0, 0, 2],
			[3, 0, 1, 2],
		])
	})
	it(`clear`, () => {
		life.clear()
		expect(life.canStep).toBe(false)
		expect(life.cells.get2d()).toStrictEqual([
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 0],
		])
	})
})

describe(`step Generation & UNDEAD`, () => {
	const life = new LifeGame().init([
		[0, 0, -1, 0],
		[0, 0, 0, 0],
		[0, 0, -1, 0],
	])
	life.setRule('B234/S2/C5')
	it(`step 1`, () => {
		life.step()
		expect(life.canStep).toBe(true)
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
	it(`clear`, () => {
		life.clear()
		expect(life.cells.get2d()).toStrictEqual([
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 0],
		])
	})
})

describe('ticker', () => {
	const life = new LifeGame().init([
		[0, 0, -1, 0],
		[0, 0, 0, 0],
		[0, 0, -1, 0],
	])
	life.setRule('B234/S2/C5')

	it(`start`, async () => {
		life.start()
		await sleep(1000)
		expect(life.isRunning).toBe(true)
		await sleep(1000)
		life.stop()
		expect(life.isRunning).toBe(false)

		const cell = life.ticker.count % 5

		expect(life.cells.get2d()).toStrictEqual([
			[0, cell, -1, cell],
			[0, cell, cell, cell],
			[0, cell, -1, cell],
		])
	})
})
