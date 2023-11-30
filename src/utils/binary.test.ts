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
		expect(sMyOutput).toBe('Base 64 — Mozilla Developer Network')
	})
})
