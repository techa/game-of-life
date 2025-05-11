// https://vitest.dev/api/expect.html
// https://jestjs.io/docs/expect
import { describe, it, expect, test } from 'vitest'
import { fromBase64, fromBinary, toBase64, toBinary } from './cellsBase64.js'

describe(`toBinary`, () => {
	it(`toBinary([0])`, () => {
		const result = toBinary([0])
		expect(result).toMatchObject({
			bitSize: 1,
			bytes: [],
			minValue: 0,
		})
		expect(
			fromBinary(result.bytes, result.bitSize, result.minValue),
		).toStrictEqual([])
	})
	it(`toBinary([1])`, () => {
		const result = toBinary([1])
		expect(result).toMatchObject({
			bitSize: 1,
			bytes: [0b10000000],
			minValue: 0,
		})
		expect(
			fromBinary(result.bytes, result.bitSize, result.minValue),
		).toStrictEqual([1, 0, 0, 0, 0, 0, 0, 0])
	})
	it(`toBinary([-1])`, () => {
		const result = toBinary([-1])
		expect(result).toMatchObject({
			bitSize: 1,
			bytes: [0b10000000],
			minValue: -1,
		})
		expect(
			fromBinary(result.bytes, result.bitSize, result.minValue),
		).toStrictEqual([-1, 0, 0, 0, 0, 0, 0, 0])
	})
	it(`toBinary([-1,2])`, () => {
		const result = toBinary([-1, 2])
		expect(result).toMatchObject({
			bitSize: 2,
			bytes: [0b11_10_00_00],
			minValue: -1,
		})
		expect(
			fromBinary(result.bytes, result.bitSize, result.minValue),
		).toStrictEqual([-1, 2, 0, 0])
	})
	it(`toBinary([-1, 2, 0, 1])`, () => {
		const result = toBinary([-1, -2, 0, 1])
		expect(result).toMatchObject({
			bitSize: 2,
			bytes: [0b11_10_00_01],
			minValue: -2,
		})
		expect(
			fromBinary(result.bytes, result.bitSize, result.minValue),
		).toStrictEqual([-1, -2, 0, 1])
	})
	it(`toBinary([3, 2, 0, 1])`, () => {
		const result = toBinary([3, 2, 0, 1])
		expect(result).toMatchObject({
			bitSize: 2,
			bytes: [0b11_10_00_01],
			minValue: 0,
		})
		expect(
			fromBinary(result.bytes, result.bitSize, result.minValue),
		).toStrictEqual([3, 2, 0, 1])
	})
	it(`toBinary([7, 2])`, () => {
		const result = toBinary([7])
		expect(result).toMatchObject({
			bitSize: 3,
			bytes: [0b111_000_00],
			minValue: 0,
		})
		expect(
			fromBinary(result.bytes, result.bitSize, result.minValue),
		).toStrictEqual([7, 0])
	})

	// it(`toBinary([1000])`, () => {
	// 	const result = toBinary([510])
	// 	expect(result).toMatchObject({
	// 		bitSize: 10,
	// 		bytes: [0b11_10_00_00],
	// 		minValue: 0,
	// 	})
	// 	expect(
	// 		fromBinary(result.bytes, result.bitSize, result.minValue),
	// 	).toStrictEqual([-1, 2, 0, 0])
	// })
	it(`toBinary 4`, () => {
		expect(toBinary([0, 1, 0, 1]).bytes).toStrictEqual([0b01010000])
	})
	it(`toBinary 30`, () => {
		expect(
			toBinary([
				0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0,
				1, 0, 0, 1, 1, 0, 1, 0, 1,
			]).bytes,
		).toStrictEqual([0b0100_0011, 0b1101_0000, 0b1111_0100, 0b1101_0100])
	})
	// it(`uncompress 7`, () => {
	// 	expect(
	// 		//        2   1  2  2  12  2   0
	// 		toBinary([0, -1, 0, 0, 10, 0, -2]).bytes,
	// 	).toStrictEqual([33, 34, 194])
	// })

	// it(`bitSize: 5`, () => {
	// 	expect(
	// 		//        2   1  2  2  30  2   0
	// 		toBinary([0, -1, 0, 0, 28, 0, -2]),
	// 	).toStrictEqual({
	// 		bitSize: 5,
	// 		bytes: [65, 66, 962, 0],
	// 		minValue: -2,
	// 	})
	// })
	// it(`toBinary([0, -2, 3, 0, 0, 0, 0])`, () => {
	// 	const cells = [0, -2, 3, 0, 0, 0, 0]
	// 	const data = toBinary(cells)
	// 	expect(data).toStrictEqual({
	// 		bitSize: 3,
	// 		bytes: [0b000_110_01, 0b1_0000000],
	// 	})
	// })
})

describe(`fromBinary`, () => {
	it(`compress 4`, () => {
		expect(fromBinary([0b01010000], 1, 0)).toStrictEqual([
			0, 1, 0, 1,
			// 余り
			0, 0, 0, 0,
		])
	})
	it(`compress 30`, () => {
		expect(
			fromBinary(
				[0b0100_0011, 0b1101_0000, 0b1111_0100, 0b1101_0100],
				1,
				0,
			),
		).toStrictEqual([
			0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0,
			0, 1, 1, 0, 1, 0, 1,
			// 余り
			0, 0,
		])
	})
	it(`uncompress 8`, () => {
		// const result = toBinary([0, -1, 0, 0, 10, 0, -2, 1])
		// expect(result).toMatchObject({
		// 	bitSize: 4,
		// 	bytes: [1, 0, 160, 33],
		// 	minValue: -2,
		// })
		expect(
			fromBinary(
				[0b0010_0001, 0b0010_0010, 0b1100_0010, 0b0000_0011],
				4,
				-2,
			),
			//           2   1  2  2  12  2   0  3
		).toStrictEqual([2, 1, 2, 2, 12, 2, 0, 3])
	})
	it(`uncompress 7`, () => {
		expect(
			fromBinary(
				[0b0010_0001, 0b0010_0010, 0b1100_0010, 0b0000_0000],
				4,
				-2,
			),
			//        0, -1, 0, 0, 10, 0, -2, -2     // 余り
		).toStrictEqual([2, 1, 2, 2, 12, 2, 0, 0])
	})
})

describe(`Base64`, () => {
	const BASE64 =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
	it(`binary 4`, () => {
		const baseStr = toBase64([0, 1, 0, 1])
		expect(baseStr).toBe(BASE64[0b010100] + BASE64[0b000000] + '==')

		expect(fromBase64('UA==')).toStrictEqual([
			0, 1, 0, 1,
			// 余り
			0, 0, 0, 0,
		])
	})
	it(`binary 30`, () => {
		const baseStr = toBase64([
			0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0,
			0, 1, 1, 0, 1, 0, 1,
		])
		expect(baseStr).toBe(
			BASE64[0b010000] +
				BASE64[0b11_1101] +
				BASE64[0b0000_11] +
				BASE64[0b110100] +
				BASE64[0b1101_01] +
				BASE64[0b000000] +
				'==',
		)

		expect(fromBase64('Q9D01A==')).toStrictEqual([
			0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0,
			0, 1, 1, 0, 1, 0, 1,
			// 余り
			0, 0,
		])
	})
	it(`none binary 8`, () => {
		const baseStr = toBase64([0, -1, 0, 0, 10, 0, -2, 1])
		expect(fromBase64(baseStr))
			//              2   1  2  2  12  2   0  3
			.toStrictEqual([0, -1, 0, 0, 10, 0, -2, 1])
		expect(baseStr).toBe('DwCg4Q==.4')
	})
	it(`none binary 7`, () => {
		const baseStr = toBase64([0, -1, 0, 0, 10, 0, -2])
		expect(fromBase64(baseStr)).toStrictEqual([
			0, -1, 0, 0, 10, 0, -2,

			// 余り
			0,
		])
		expect(baseStr).toBe('DwCg4A==.4')
	})

	it(`compress`, () => {
		const baseStr = toBase64([0, -1, 10, 0, 0, 0, 0])
		expect(baseStr).toBe('D6A=.4')
	})

	test(`0, -1, 1, -2`, () => {
		const baseStr = toBase64([0, -1, 1, -2])
		expect(fromBase64(baseStr)).toStrictEqual([0, -1, 1, -2])
		expect(baseStr).toBe('Ng==.2')
	})
	test(`-2, -1, 3, 0`, () => {
		const baseStr = toBase64([-2, -1, 3, 0])
		expect(fromBase64(baseStr)).toStrictEqual([-2, -1, 3, 0, 0])
		expect(baseStr).toBe('3YA=.3')
	})
	test(`2, 1, 3, 0`, () => {
		const baseStr = toBase64([2, 1, 3, 0])
		expect(fromBase64(baseStr)).toStrictEqual([2, 1, 3, 0])
		expect(baseStr).toBe('nA==.2')
	})
	test(`7, -1, 5, 0`, () => {
		const baseStr = toBase64([7, -1, 5, 0])
		expect(fromBase64(baseStr)).toStrictEqual([7, -1, 5, 0])
		expect(baseStr).toBe('f1A=.4')
	})
	test(`10, -1, 15, 0`, () => {
		const baseStr = toBase64([10, -1, 15, 0])
		expect(fromBase64(baseStr)).toStrictEqual([10, -1, 15])
	})

	test(`0, -1, -2, 0, 0, 0, 0`, () => {
		const baseStr = toBase64([0, -1, -2, 0, 0, 0, 0])
		expect(fromBase64(baseStr)).toStrictEqual([0, -1, -2, 0])
	})
	test(`0, 1, 0, 1, 0, 1, 0, 1`, () => {
		const baseStr = toBase64([0, 1, 0, 1, 0, 1, 0, 1])
		expect(fromBase64(baseStr)).toStrictEqual([0, 1, 0, 1, 0, 1, 0, 1])
	})
	test(`0, -1, 0, -2, 0, -1, 0, -2`, () => {
		const baseStr = toBase64([0, -1, 0, -2, 0, -1, 0, -2])
		expect(fromBase64(baseStr)).toStrictEqual([0, -1, 0, -2, 0, -1, 0, -2])
	})
	test(`0, 0, 0, 0, 0, 0, 0, 0`, () => {
		const baseStr = toBase64([0, 0, 0, 0, 0, 0, 0, 0])
		expect(baseStr).toBe('')
		expect(fromBase64(baseStr)).toStrictEqual([])
	})
	test(`1, 1, 1, 1, 1, 1, 1, 1`, () => {
		const baseStr = toBase64([1, 1, 1, 1, 1, 1, 1, 1])
		expect(fromBase64(baseStr)).toStrictEqual([1, 1, 1, 1, 1, 1, 1, 1])
	})
	test(`-1, -1, -1, -1, -1, -1, -1, -1`, () => {
		const baseStr = toBase64([-1, -1, -1, -1, -1, -1, -1, -1])
		expect(fromBase64(baseStr)).toStrictEqual([
			-1, -1, -1, -1, -1, -1, -1, -1,
		])
		expect(baseStr).toBe('/w==.1')
	})
	test(`-2, -2, -2, -2, -2, -2, -2, -2`, () => {
		const baseStr = toBase64([-2, -2, -2, -2, -2, -2, -2, -2])
		expect(fromBase64(baseStr)).toStrictEqual([
			-2, -2, -2, -2, -2, -2, -2, -2,
		])
		expect(baseStr).toBe('qqo=.2')
	})
	test(`-2, -2, -2, -2, -2, -2, -2, 1`, () => {
		const baseStr = toBase64([-2, -2, -2, -2, -2, -2, -2, 1])
		expect(fromBase64(baseStr)).toStrictEqual([
			-2, -2, -2, -2, -2, -2, -2, 1,
		])
		expect(baseStr).toBe('qqk=.2')
	})
	test(`-2, -2, -2, -2, -2, -2, -2, 2`, () => {
		const baseStr = toBase64([-2, -2, -2, -2, -2, -2, -2, 2])
		expect(fromBase64(baseStr)).toStrictEqual([
			-2, -2, -2, -2, -2, -2, -2, 2,
		])
		expect(baseStr).toBe('222y.3')
	})
})
