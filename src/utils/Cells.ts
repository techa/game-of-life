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

export function strBinaryToBase64(strBinary: string) {
	const arr = new Uint8Array(Math.ceil(strBinary.length / 8))
	let i = 0
	while (strBinary) {
		const u8 = strBinary.substring(0, 8).padEnd(8, '0')
		strBinary = strBinary.slice(8)
		const val = parseInt(u8, 2)
		arr[i++] = val
	}
	return base64EncArr(arr)
}

export function base64ToStrBinary(base64: string) {
	return base64DecToArr(base64).reduce(
		(str, v) => str + v.toString(2).padStart(8, '0'),
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

	encode() {
		const binary = this.values.join('')
		const base64 = strBinaryToBase64(binary)
		const d10 = parseInt(binary, 2)
		const num36 = d10.toString(36)
		const b = +(
			d10 < Number.MAX_SAFE_INTEGER && num36.length < base64.length
		)
		return `${this.columns}/${this.rows}${b ? ':' : '-'}${
			b ? num36 : base64
		}`
	}

	decode(str: string) {
		const b = !!str.includes(':')
		const [w, h, d] = str.split(/[/:-]/).map((v) => +v || v) as [
			number,
			number,
			string,
		]
		this.values = (
			b
				? parseInt(d, 36)
						.toString(2)
						.padStart(+w * +h, '0')
				: base64ToStrBinary(d)
		)
			.slice(0, w * h)
			.split('')
			.map((v) => +v)
		this.columns = w
		this.rows = h
		return this
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
}
