// https://vitest.dev/api/expect.html
// https://jestjs.io/docs/expect
import { describe, it, expect } from 'vitest'
import { base64DecToArr, arrEncToBase64 } from './binary.js'

/**
 * @link https://developer.mozilla.org/ja/docs/Glossary/Base64#テスト
 */

/* UTF-8 array to JS string and vice versa */

export function UTF8ArrToStr(aBytes: Uint8Array) {
	let sView = ''
	let nPart
	const nLen = aBytes.length
	for (let nIdx = 0; nIdx < nLen; nIdx++) {
		nPart = aBytes[nIdx]
		sView += String.fromCodePoint(
			nPart > 251 && nPart < 254 && nIdx + 5 < nLen /* six bytes */
				? /* (nPart - 252 << 30) may be not so safe in ECMAScript! So…: */
				  (nPart - 252) * 1073741824 +
						((aBytes[++nIdx] - 128) << 24) +
						((aBytes[++nIdx] - 128) << 18) +
						((aBytes[++nIdx] - 128) << 12) +
						((aBytes[++nIdx] - 128) << 6) +
						aBytes[++nIdx] -
						128
				: nPart > 247 && nPart < 252 && nIdx + 4 < nLen /* five bytes */
				? ((nPart - 248) << 24) +
				  ((aBytes[++nIdx] - 128) << 18) +
				  ((aBytes[++nIdx] - 128) << 12) +
				  ((aBytes[++nIdx] - 128) << 6) +
				  aBytes[++nIdx] -
				  128
				: nPart > 239 && nPart < 248 && nIdx + 3 < nLen /* four bytes */
				? ((nPart - 240) << 18) +
				  ((aBytes[++nIdx] - 128) << 12) +
				  ((aBytes[++nIdx] - 128) << 6) +
				  aBytes[++nIdx] -
				  128
				: nPart > 223 &&
				  nPart < 240 &&
				  nIdx + 2 < nLen /* three bytes */
				? ((nPart - 224) << 12) +
				  ((aBytes[++nIdx] - 128) << 6) +
				  aBytes[++nIdx] -
				  128
				: nPart > 191 && nPart < 224 && nIdx + 1 < nLen /* two bytes */
				? ((nPart - 192) << 6) + aBytes[++nIdx] - 128
				: /* nPart < 127 ? */ /* one byte */
				  nPart,
		)
	}
	return sView
}

export function strToUTF8Arr(sDOMStr: string) {
	let aBytes
	let nChr: number
	const nStrLen = sDOMStr.length
	let nArrLen = 0

	/* mapping… */
	for (let nMapIdx = 0; nMapIdx < nStrLen; nMapIdx++) {
		nChr = sDOMStr.codePointAt(nMapIdx) || 0

		if (nChr > 65536) {
			nMapIdx++
		}

		nArrLen +=
			nChr < 0x80
				? 1
				: nChr < 0x800
				? 2
				: nChr < 0x10000
				? 3
				: nChr < 0x200000
				? 4
				: nChr < 0x4000000
				? 5
				: 6
	}

	aBytes = new Uint8Array(nArrLen)

	/* transcription… */
	let nIdx = 0
	let nChrIdx = 0
	while (nIdx < nArrLen) {
		nChr = sDOMStr.codePointAt(nChrIdx) || 0
		if (nChr < 128) {
			/* one byte */
			aBytes[nIdx++] = nChr
		} else if (nChr < 0x800) {
			/* two bytes */
			aBytes[nIdx++] = 192 + (nChr >>> 6)
			aBytes[nIdx++] = 128 + (nChr & 63)
		} else if (nChr < 0x10000) {
			/* three bytes */
			aBytes[nIdx++] = 224 + (nChr >>> 12)
			aBytes[nIdx++] = 128 + ((nChr >>> 6) & 63)
			aBytes[nIdx++] = 128 + (nChr & 63)
		} else if (nChr < 0x200000) {
			/* four bytes */
			aBytes[nIdx++] = 240 + (nChr >>> 18)
			aBytes[nIdx++] = 128 + ((nChr >>> 12) & 63)
			aBytes[nIdx++] = 128 + ((nChr >>> 6) & 63)
			aBytes[nIdx++] = 128 + (nChr & 63)
			nChrIdx++
		} else if (nChr < 0x4000000) {
			/* five bytes */
			aBytes[nIdx++] = 248 + (nChr >>> 24)
			aBytes[nIdx++] = 128 + ((nChr >>> 18) & 63)
			aBytes[nIdx++] = 128 + ((nChr >>> 12) & 63)
			aBytes[nIdx++] = 128 + ((nChr >>> 6) & 63)
			aBytes[nIdx++] = 128 + (nChr & 63)
			nChrIdx++
		} /* if (nChr <= 0x7fffffff) */ else {
			/* six bytes */
			aBytes[nIdx++] = 252 + (nChr >>> 30)
			aBytes[nIdx++] = 128 + ((nChr >>> 24) & 63)
			aBytes[nIdx++] = 128 + ((nChr >>> 18) & 63)
			aBytes[nIdx++] = 128 + ((nChr >>> 12) & 63)
			aBytes[nIdx++] = 128 + ((nChr >>> 6) & 63)
			aBytes[nIdx++] = 128 + (nChr & 63)
			nChrIdx++
		}
		nChrIdx++
	}

	return aBytes
}

describe(`./binary.js`, () => {
	const sMyInput = 'Base 64 \u2014 Mozilla Developer Network'
	it(`${sMyInput}`, () => {
		const aMyUTF8Input = strToUTF8Arr(sMyInput)
		const sMyBase64 = arrEncToBase64(aMyUTF8Input)
		expect(sMyBase64).toBe(
			'QmFzZSA2NCDigJQgTW96aWxsYSBEZXZlbG9wZXIgTmV0d29yaw==',
		)

		const aMyUTF8Output = base64DecToArr(sMyBase64)
		const sMyOutput = UTF8ArrToStr(aMyUTF8Output)
		expect(sMyOutput).toBe('Base 64 — Mozilla Developer Network')
	})
})
