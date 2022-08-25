export function randomHex(): string {
	return '#' + Math.random().toString(16).slice(-6)
}

export function hexToRgb(hex: string): number[] {
	return hex
		.slice(1)
		.match(/^(..)(..)(..)/)
		.slice(1, 4)
		.map((v) => parseInt(v, 16))
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
	return hslString
		.match(/^hsl\((\d+),(\d+)%,(\d+)%\)/)
		.slice(1)
		.map((v) => +v)
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

/**
 * Hex or HSLstring to HSLstring
 * @param hexOrHsl
 * @param hue
 * @return HSLstring
 */
export function hueGradColor(hexOrHsl: string, hue: number): string {
	const [h, s, l] = colorStringToHsl(hexOrHsl)
	return `hsl(${(h + hue) % 360},${s}%,${l}%)`
}

/**
 * Hex to hex only
 * @param hex
 * @param n
 * @return Hex
 */
export function gradColor(hex: string, n: number = 40): string {
	return hex
		.slice(1)
		.match(/^(..)(..)(..)/)
		.slice(1, 4)
		.map(
			(v) =>
				(parseInt(v, 16) + (Math.random() * n * 2 - n)).clamp(10, 245) |
				0,
		)
		.reduce(
			(str: string, val: number) =>
				str + val.toString(16).padStart(2, '0'),
			'#',
		)
}
