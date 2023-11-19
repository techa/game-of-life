import { Array2d } from './Array2d.js'
import { base64DecToArr, base64EncArr } from './binary.js'

export const enum Cell {
	TOMB = -2,
	UNDEAD,
	DEATH,
	LIVE,
}

export const enum DataType {
	base64,
	number36,
	binary,
}

export interface MiniData {
	/**
	 * name
	 */
	n?: string
	/**
	 * width
	 */
	w: number
	/**
	 * height
	 */
	h: number
	/**
	 * 1 = binary
	 * 0|undefined = base64(ASCII)
	 */
	b?: 1 | 0
	/**
	 * data
	 */
	d: string
}

/**
 * * `x-y:36radixNumber` or `x-y-Base64String`
 */
export type DataTemp = `${number}-${number}${':' | '-'}${string}`

export type DataBit = 1 | 2 | 4 | 8
/**
 *
 * @param strBinary
 * @param bit 1,2,4,8
 */
export function strBinaryToBase64(strBinary: string, bit: DataBit = 1) {
	const digit = 8 / bit
	const arr = new Uint8Array(Math.ceil(strBinary.length / digit))
	let i = 0
	while (strBinary) {
		const uint = strBinary.substring(0, digit).padEnd(digit, '0')
		strBinary = strBinary.slice(digit)
		const val = parseInt(uint, 2 * bit)
		arr[i++] = val
	}
	return base64EncArr(arr)
}

export function base64ToStrBinary(base64: string, bit: DataBit = 1) {
	return base64DecToArr(base64).reduce(
		(str, v) => str + v.toString(2 * bit).padStart(8 / bit, '0'),
		'',
	)
}

export class Cells extends Array2d<Cell> {
	compress(): MiniData {
		const binary = this.values.join('')
		const base64 = strBinaryToBase64(binary)
		const d10 = parseInt(binary, 2)
		const num36 = d10.toString(36)
		const b = +(
			d10 < Number.MAX_SAFE_INTEGER && num36.length < base64.length
		)
		const data: MiniData = {
			w: this.columns,
			h: this.rows,
			d: b ? num36 : base64,
		}
		if (b) {
			data.b = 1
		}
		return data
	}

	decompress({ w, h, b, d }: MiniData) {
		this.values = (
			b
				? parseInt(d, 36)
						.toString(2)
						.padStart(w * h, '0')
				: base64ToStrBinary(d)
		)
			.slice(0, w * h)
			.split('')
			.map((v) => +v)
		this.columns = w
		this.rows = h
		return this
	}

	/**
	 *
	 * @param bit
	 * 1. = lexicon load (DEATH:0, LIVE:1)
	 * 2. = cells table save (TOMB:-2, UNDEAD:-1, DEATH:0, LIVE:1)
	 * 8. = cells table state (Generation:2~253)
	 * @returns "x-y:36radix" or "x-y-Base64DataString"
	 */
	encode(bit: DataBit = 2): DataTemp {
		const binary = this.values.map((v) => (bit > 1 ? v + 2 : v)).join('')
		const base64 = strBinaryToBase64(binary, bit)
		const d10 = parseInt(binary, 2 ** bit)

		// binaryを１つの数字として見做した36進数
		const num36 = d10.toString(36)
		const b = +(
			d10 < Number.MAX_SAFE_INTEGER && num36.length < base64.length
		)
		return `${this.columns}-${this.rows}${b ? ':' : '-'}${
			b ? num36 : base64
		}`
	}

	decode(str: string, bit: DataBit = 2) {
		try {
			const b = !!str.includes(':')
			const [w, h, d] = str.split(/[:-]/).map((v) => +v || v) as [
				number,
				number,
				string,
			]
			this.values = (
				b
					? parseInt(d, 36)
							.toString(2 ** bit)
							.padStart(w * h, '0')
					: base64ToStrBinary(d, bit)
			)
				.slice(0, w * h)
				.split('')
				.map((v) => (bit > 1 ? +v - 2 : +v))
			this.columns = w
			this.rows = h
		} catch (err) {
			console.error(err)
		}

		return this
	}
}
