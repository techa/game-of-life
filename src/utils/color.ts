export function randomHex(): string {
	return '#' + Math.random().toString(16).slice(-6)
}

export function hexToRgb(hex: string): number[] {
	const m = hex.slice(1).match(/^(..)(..)(..)/)
	if (!m) {
		throw new TypeError(`Invaild-value(hex): '${hex}'`)
	}
	return m.slice(1, 4).map((v) => parseInt(v, 16))
}

export function rgbToHsl(rgb: number[]): number[] {
	const [r, g, b] = rgb.map((v) => v / 255)
	const min = Math.min(r, g, b)
	const max = Math.max(r, g, b)
	const delta = max - min

	let h = 0
	let s = 0
	const l = (min + max) / 2

	if (delta > 1e-6) {
		if (r === max) {
			h = (g - b) / delta
		} else if (g === max) {
			h = 2 + (b - r) / delta
		} else if (b === max) {
			h = 4 + (r - g) / delta
		}

		if (l <= 0.5) {
			s = delta / (max + min)
		} else {
			s = delta / (2 - max - min)
		}
	}

	h = Math.min(h * 60, 360)

	if (h < 0) {
		h += 360
	}

	return [h | 0, (s * 100) | 0, (l * 100) | 0]
}

/**
 * Hex to HSL
 * @param hex
 * @return HSL
 */
export function hexToHsl(hex: string): number[] {
	return rgbToHsl(hexToRgb(hex))
}

/**
 *  HSLstring to HSL
 * @param hslString HSLstring
 * @return HSL
 */
export function hslStringParse(hslString: string): number[] {
	const m = hslString
		.replace(/\s*/g, '')
		.match(/^hsl\((\d?[.]?\d+),(\d+)%,(\d+)%\)/)
	if (!m) {
		throw new TypeError(`Invaild-value(hslString): '${hslString}'`)
	}
	return m.slice(1).map((v) => +v)
}

/**
 * Hex or HSLstring to HSL
 * @param hexOrHsl
 * @return HSL
 */
export function colorStringToHsl(hexOrHsl: string): number[] {
	return /^#\w{6,}$/i.test(hexOrHsl)
		? rgbToHsl(hexToRgb(hexOrHsl))
		: hslStringParse(hexOrHsl)
}

export class NextColor {
	hueIncr = 1

	constructor() {
		this.init()
	}
	init() {
		this.hueIncr = 1
	}

	/**
	 * Hex or HSLstring to HSLstring
	 * @param hexOrHsl
	 * @param hueRange min value 36
	 * @return HSLstring
	 */
	next(hexOrHsl: string, hueRange = 36): string {
		const [h, s, l] = colorStringToHsl(hexOrHsl)
		return `hsl(${(h + hueRange) % 360},${s}%,${
			!(this.hueIncr++ % 10) ? l - 10 : l
		}%)`
	}
}
