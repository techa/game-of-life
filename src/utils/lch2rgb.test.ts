// https://vitest.dev/api/expect.html
// https://jestjs.io/docs/expect
import { describe, it, expect, test } from 'vitest'
import { lch2rgb } from './lch2rgb.js'

describe(`./lch2rgb.js`, () => {
	it(`lch(100%, 230, 0)`, () => {
		expect(lch2rgb(100, 230, 0)).toBe('#ff00ff')
	})
	it(`lch(40.39% 52.3 128.03)`, () => {
		expect(lch2rgb(40.39, 52.3, 128.03)).toBe('#326c0e')
	})
	it(`lch(59.98% 52.23 82.56)`, () => {
		expect(lch2rgb(59.98, 52.23, 82.56)).toBe('#ae8b2f')
	})
})

test(`rainbow`, () => {
	const chroma = 120
	expect([
		lch2rgb(100, chroma, 0),
		lch2rgb(100, chroma, 45),
		lch2rgb(100, chroma, 90),
		lch2rgb(100, chroma, 135),
		lch2rgb(100, chroma, 180),
		lch2rgb(100, chroma, 225),
		lch2rgb(100, chroma, 270),
		lch2rgb(100, chroma, 315),
	]).toStrictEqual([
		'#ff6aff',
		'#ffac5a',
		'#fffc00',
		'#35ff32',
		'#00fffb',
		'#00ffff',
		'#00ffff',
		'#ffb9ff',
	])
})
