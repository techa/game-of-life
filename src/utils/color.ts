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
	const m = hslString.match(/^hsl\((\d+),(\d+)%,(\d+)%\)/)
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

export type NextColorType = 'hue' | 'random'
export type NextColorGenerater = (str: string, n?: number) => string

let hueIncr = 1
/**
 * Next gradient color generaters.
 */
export const NextColor: Record<NextColorType, NextColorGenerater> = {
	/**
	 * Hex or HSLstring to HSLstring
	 * @param hexOrHsl
	 * @param hue
	 * @return HSLstring
	 */
	hue(hexOrHsl: string, hue = 36): string {
		const [h, s, l] = colorStringToHsl(hexOrHsl)
		return `hsl(${(h + hue) % 360},${s}%,${
			!(hueIncr++ % 10) ? l - 10 : l
		}%)`
	},

	/**
	 * Hex to hex only
	 * @param hex
	 * @param difference RGB-value total difference
	 * @return Hex
	 */
	random(hex: string, difference = 60): string {
		const m = hex.slice(1).match(/^(..)(..)(..)/)
		if (!m) {
			throw new TypeError(`Invaild-value(hex): '${hex}'`)
		}
		return m
			.slice(1, 4)
			.map((val) => {
				const rgbvalue = parseInt(val, 16)
				let del = (Math.random() * difference) | 0
				difference -= del
				if (difference > 0) {
					// Color should not be too light.
					if (rgbvalue + del > 240) {
						del *= -1
						// Color should not be too dark.
					} else if (rgbvalue - del > 20) {
						del *= (Math.random() * 2) | 0 ? -1 : 1
					}
				}

				return (rgbvalue + del) | 0
			})
			.reduce(
				(str: string, val: number) =>
					str + val.toString(16).padStart(2, '0'),
				'#',
			)
	},
}
