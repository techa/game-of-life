// https://vitest.dev/api/expect.html
// https://jestjs.io/docs/expect
import { describe, it, expect } from 'vitest'
import {
	base64ToStr,
	base64DecToArr,
	arrEncToBase64,
	strToBase64,
} from './binary.js'

describe(`./binary.js`, () => {
	const sMyInput = 'Base 64 \u2014 Mozilla Developer Network'
	it(`${sMyInput}`, () => {
		const sMyBase64 = strToBase64(sMyInput)
		expect(sMyBase64).toBe(
			'QmFzZSA2NCDigJQgTW96aWxsYSBEZXZlbG9wZXIgTmV0d29yaw==',
		)

		const sMyOutput = base64ToStr(sMyBase64)
		expect(sMyOutput).toBe(sMyInput)
	})

	it(`btoa,atob`, () => {
		const data = new Uint8Array(4)
		// [       0,        0,        0,         0]
		// 000000 00,0000 0000,00 000000, 000000 00
		// A      A       A       A       A      A =
		expect(arrEncToBase64(data)).toBe('AAAAAA==')

		// B      A       A       Z       A      A =
		// 000001 00,0000 0000,00 011001, 000000 00
		// [       4,        0,       25,         0]
		expect(base64DecToArr('BAAZAA==')).toStrictEqual(
			new Uint8Array([4, 0, 25, 0]),
		)
	})

	it(`https://developer.mozilla.org/ja/docs/Glossary/Base64`, () => {
		function base64ToBytes(base64: string) {
			const binString = atob(base64)
			return Uint8Array.from(binString, (m) => m.codePointAt(0) || 0)
		}

		function bytesToBase64(bytes: Uint8Array) {
			return btoa(String.fromCharCode(...bytes))
		}
		expect(base64ToBytes('BAAZAA==')).toStrictEqual(
			new Uint8Array([4, 0, 25, 0]),
		)
		expect(bytesToBase64(new Uint8Array(4))).toBe('AAAAAA==')

		expect(
			new TextDecoder().decode(base64ToBytes('YSDEgCDwkICAIOaWhyDwn6aE')),
		).toBe('a Ā 𐀀 文 🦄')
		expect(bytesToBase64(new TextEncoder().encode('a Ā 𐀀 文 🦄'))).toBe(
			'YSDEgCDwkICAIOaWhyDwn6aE',
		)
	})
})
