// https://vitest.dev/api/expect.html
// https://jestjs.io/docs/expect
import { describe, it, expect, test } from 'vitest'
import {
	Cells,
	strBinaryToBase64,
	base64ToStrBinary,
	type DataTemp,
} from './Cells.js'

import { readFile, writeFile } from 'fs/promises'

describe(`lexicon`, async () => {
	const txt = await readFile('./lex_asc/lexicon.txt', 'utf-8')
	const lines = txt.split(/\r?\n/g)
	let title = ''
	let pattern: (0 | 1)[][] = []

	const datas: { n: string; d: DataTemp }[] = []
	const patterns: (typeof pattern)[] = []

	// results count
	let b1Count = 0

	let pCount = 0
	let pCountMax = 0

	for (const line of lines) {
		const lineIsPattern = /\t[*.]+$/.test(line)
		if (lineIsPattern) {
			pattern.push(
				line
					.replace(/[^.*]/g, '')
					.split('')
					.map((v) => (v === '*' ? 1 : 0)),
			)
		} else {
			const newTitle = /^:(.+?):/.exec(line)?.[1]
			if (newTitle) {
				title = newTitle
				pCount = 0
			}
		}

		if (pattern.length && !lineIsPattern) {
			pCount++
			if (pCount > 1) {
				title = title.replace(/( \(\d+\))?$/, ` (${pCount})`)
			}
			if (pCountMax < pCount) {
				pCountMax = pCount
			}

			// Add data & pattern
			const cells = new Cells(pattern, 0).encode(1)
			datas.push({
				n: title,
				d: cells,
			})
			patterns.push(JSON.parse(JSON.stringify(pattern)))

			if (cells.includes(':')) {
				b1Count++
			}

			pattern = []
		}
	}

	test(`snapshot`, () => {
		expect(b1Count).toBe(145)
		expect(datas.length).toBe(733)
		expect(pCountMax).toBe(3)
		expect(datas).toMatchSnapshot()
	})

	it(`data decompress tests`, () => {
		const cell = new Cells([[]], 0)
		test.each(datas.map((data, i) => ({ ...data, p: patterns[i] })))(
			'$n',
			(data) => {
				expect(cell.decode(data.d, 1)).toStrictEqual(data.p)
			},
		)
	})

	writeFile('./src/resource/lexicon.min.json', JSON.stringify(datas))
})

describe(`./Cells.js`, () => {
	it(`strBinaryToBase64, 1`, () => {
		expect(strBinaryToBase64('111010001111011')).toBe('6PY=')
		expect(base64ToStrBinary('6PY=')).toBe('1110100011110110')

		expect(strBinaryToBase64('000010001111011')).toBe('CPY=')
		expect(base64ToStrBinary('CPY=')).toBe('0000100011110110')
	})

	it(`strBinaryToBase64, 2`, () => {
		expect(strBinaryToBase64('111010001111011', 2)).toBe('VEBVFA==')
		expect(base64ToStrBinary('VEBVFA==', 2)).toBe('1110100011110110')

		expect(strBinaryToBase64('000010001111011', 2)).toBe('AEBVFA==')
		expect(base64ToStrBinary('AEBVFA==', 2)).toBe('0000100011110110')

		expect(strBinaryToBase64('01200012312', 2)).toBe('GAbY')
		expect(base64ToStrBinary('GAbY', 2)).toBe('012000123120')
	})

	it(`strBinaryToBase64, 4`, () => {
		expect(strBinaryToBase64('111010001111011', 4)).toBe('CQgIAAkJAQg=')
		expect(base64ToStrBinary('CQgIAAkJAQg=', 4)).toBe('1110100011110110')

		expect(strBinaryToBase64('000010001111011', 4)).toBe('AAAIAAkJAQg=')
		expect(base64ToStrBinary('AAAIAAkJAQg=', 4)).toBe('0000100011110110')

		expect(strBinaryToBase64('01200012312', 4)).toBe('ARAAChkQ')
		expect(base64ToStrBinary('ARAAChkQ', 4)).toBe('012000123120')
	})

	it(`strBinaryToBase64, 8`, () => {
		expect(strBinaryToBase64('111010001111011', 8)).toBe(
			'AQEBAAEAAAABAQEBAAEB',
		)
		expect(base64ToStrBinary('AQEBAAEAAAABAQEBAAEB', 8)).toBe(
			'111010001111011',
		)

		expect(strBinaryToBase64('000010001111011', 8)).toBe(
			'AAAAAAEAAAABAQEBAAEB',
		)
		expect(base64ToStrBinary('AAAAAAEAAAABAQEBAAEB', 8)).toBe(
			'000010001111011',
		)

		expect(strBinaryToBase64('01200012312', 8)).toBe('AAECAAAAAQIDAQI=')
		expect(base64ToStrBinary('AAECAAAAAQIDAQI=', 8)).toBe('01200012312')
	})

	it(`shortest test`, () => {
		class Test extends Cells {
			tests() {
				const binary = this.values.join('')
				const base64 = strBinaryToBase64(binary)

				const val: string[][] = [
					['binary', binary],
					['base64', base64],
				]
				const d10 = parseInt(binary, 2)
				if (d10 < Number.MAX_SAFE_INTEGER) {
					val.push(['number', d10.toString(36)])
				}
				return val.sort((a, b) => a[1].length - b[1].length)
			}
		}
		expect(
			new Test(
				[
					[0, 1, 1, 1, 0],
					[0, 1, 1, 1, 0],
					[0, 1, 1, 1, 0],
					[0, 1, 1, 1, 0],
				],
				0,
			).tests(),
		).toStrictEqual([
			['base64', 'c5zg'],
			['number', 'a5e6'],
			['binary', '01110011100111001110'],
		])
		expect(new Test(2, 3, 0).tests()).toStrictEqual([
			['number', '0'],
			['base64', 'AA=='],
			['binary', '000000'],
		])
		expect(new Test(2, 3, 1).tests()).toStrictEqual([
			['number', '1r'],
			['base64', '/A=='],
			['binary', '111111'],
		])
		expect(new Test(12, 8, 0).tests()).toStrictEqual([
			['number', '0'],
			['base64', 'AAAAAAAAAAAAAAAA'],
			[
				'binary',
				'000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
			],
		])
		expect(new Test(12, 8, 1).tests()).toStrictEqual([
			['base64', '////////////////'],
			[
				'binary',
				'111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
			],
		])
	})

	it(`encode`, () => {
		expect(new Cells(12, 8, 0).encode(1)).toBe('12-8:0')
		expect(new Cells(12, 8, 1).encode(1)).toBe('12-8-////////////////')

		expect(new Cells([[0, 1, -2, -1]], 1).encode(2)).toBe('4-1:4x')
		expect(
			new Cells(
				[
					[0, 1, -2, -1],
					[0, -2, -1, 1],
					[-1, -1, 0, 1],
				],
				1,
			).encode(2),
		).toBe('4-3-sYdb')
	})

	it(`encode decode`, () => {
		const noo = new Cells([[]], 1)
		expect(new Cells(noo.decode('12-8:0', 1), 0).encode(1)).toBe('12-8:0')

		expect(
			new Cells(noo.decode('12-8-////////////////', 1), 1).encode(1),
		).toBe('12-8-////////////////')

		expect(new Cells(noo.decode('4-1:4x', 2), 0).encode(2)).toBe('4-1:4x')

		expect(new Cells(noo.decode('4-3-sYdb', 2), 0).encode(2)).toBe(
			'4-3-sYdb',
		)
	})

	// it(`_atob`, () => {
	// 	expect(_atob('1234')).toBe('×mø')
	// })
})
