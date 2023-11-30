// // https://www.npmjs.com/package/btoa-lite
// function _btoa(str: string) {
// 	return btoa ? btoa(str) : Buffer.from(str).toString('base64')
// }

// // https://git.coolaj86.com/coolaj86/atob.js
// function _atob(str: string) {
// 	return atob ? atob(str) : Buffer.from(str, 'base64').toString('binary')
// }

/**
 * https://developer.mozilla.org/ja/docs/Glossary/Base64#解決策その_2_-_atob_と_btoa_を_typedarray_と_utf-8_を使用して書き直す
 */

// Array of bytes to Base64 string decoding
export function b64ToUint6(nChr: number) {
	return nChr > 64 && nChr < 91
		? nChr - 65
		: nChr > 96 && nChr < 123
		? nChr - 71
		: nChr > 47 && nChr < 58
		? nChr + 4
		: nChr === 43
		? 62
		: nChr === 47
		? 63
		: 0
}

export function base64DecToArr(sBase64: string, nBlocksSize?: number) {
	const sB64Enc = sBase64.replace(/[^A-Za-z0-9+/]/g, '')
	const nInLen = sB64Enc.length
	const nOutLen = nBlocksSize
		? Math.ceil(((nInLen * 3 + 1) >> 2) / nBlocksSize) * nBlocksSize
		: (nInLen * 3 + 1) >> 2
	const taBytes = new Uint8Array(nOutLen)

	let nMod3
	let nMod4
	let nUint24 = 0
	let nOutIdx = 0
	for (let nInIdx = 0; nInIdx < nInLen; nInIdx++) {
		nMod4 = nInIdx & 3
		nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << (6 * (3 - nMod4))
		if (nMod4 === 3 || nInLen - nInIdx === 1) {
			nMod3 = 0
			while (nMod3 < 3 && nOutIdx < nOutLen) {
				taBytes[nOutIdx] = (nUint24 >>> ((16 >>> nMod3) & 24)) & 255
				nMod3++
				nOutIdx++
			}
			nUint24 = 0
		}
	}

	return taBytes
}

/* Base64 string to array encoding */
export function uint6ToB64(nUint6: number) {
	return nUint6 < 26
		? nUint6 + 65
		: nUint6 < 52
		? nUint6 + 71
		: nUint6 < 62
		? nUint6 - 4
		: nUint6 === 62
		? 43
		: nUint6 === 63
		? 47
		: 65
}

export function arrEncToBase64(bytes: Uint8Array) {
	let base64 = ''
	let uint24 = 0
	let iMod3 = 2
	const len = bytes.length
	for (let i = 0; i < len; i++) {
		iMod3 = i % 3
		if (i > 0 && ((i * 4) / 3) % 76 === 0) {
			base64 += '\r\n'
		}

		uint24 |= bytes[i] << ((16 >>> iMod3) & 24)
		if (iMod3 === 2 || len - i === 1) {
			base64 += String.fromCodePoint(
				uint6ToB64((uint24 >>> 18) & 63),
				uint6ToB64((uint24 >>> 12) & 63),
				uint6ToB64((uint24 >>> 6) & 63),
				uint6ToB64(uint24 & 63),
			)
			uint24 = 0
		}
	}

	return (
		base64.substring(0, base64.length - 2 + iMod3) +
		(iMod3 === 2 ? '' : iMod3 === 1 ? '=' : '==')
	)
}
