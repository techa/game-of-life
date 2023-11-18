function lch2lab([l, c, h]: number[]) {
	const hr = (h / 180) * Math.PI
	return [l, c * Math.cos(hr), c * Math.sin(hr)]
}

/**
 * convert white point D50 -> D65
 *
 * @link https://www.w3.org/TR/css-color-4/#color-conversion-code
 */
function D50_to_D65([x, y, z]: number[]): number[] {
	return [
		x * 0.9554734527042182 +
			y * -0.023098536874261423 +
			z * 0.0632593086610217,
		x * -0.028369706963208136 +
			y * 1.0099954580058226 +
			z * 0.021041398966943008,
		x * 0.012314001688319899 +
			y * -0.020507696433477912 +
			z * 1.3303659366080753,
	]
}
const D50 = [96.422, 100, 82.521]
function lab2xyz([l, a, b]: number[]): number[] {
	let y = (l + 16) / 116
	let x = a / 500 + y
	let z = y - b / 200

	const e = 216 / 24389 // 6^3/29^3
	const k = 24389 / 27 // 29^3/3^3

	const x2 = x ** 3
	const z2 = z ** 3
	x = x2 > e ? x2 : (x - 16 / 116) / k
	y = l > k * e ? ((l + 16) / 116) ** 3 : l / k
	z = z2 > e ? z2 : (z - 16 / 116) / k

	return D50_to_D65([x, y, z].map((val, i) => val * D50[i]))
}

function clamp(val: number, max = 1, min = 0): number {
	return val > max ? max : val > min ? val : min
}

/**
 * Assume linear-light sRGB -> gamma corrected sRGB
 *
 * @link https://www.w3.org/TR/css-color-4/#color-conversion-code
 */
export function toGamma(val: number): number {
	return (
		clamp(
			val > 0.0031308 ? 1.055 * val ** (1.0 / 2.4) - 0.055 : val * 12.92,
		) * 255
	)
}
function xyz2rgb([x, y, z]: number[]): number[] {
	x /= 100
	y /= 100
	z /= 100
	return [
		toGamma(
			3.2409699419045226 * x +
				-1.537383177570094 * y +
				-0.4986107602930034 * z,
		),
		toGamma(
			-0.9692436362808796 * x +
				1.8759675015077202 * y +
				0.04155505740717559 * z,
		),
		toGamma(
			0.05563007969699366 * x +
				-0.20397695888897652 * y +
				1.0569715142428786 * z,
		),
	]
}

function toHex(rgb: number[]) {
	return rgb.reduce(
		(str, v) => str + Math.round(v).toString(16).padStart(2, '0'),
		'#',
	)
}

/**
 *
 * @param l 0-100
 * @param c 0-230
 * @param h 0-360
 * @returns
 */
export function lch2rgb(l: number, c: number, h: number) {
	return toHex(xyz2rgb(lab2xyz(lch2lab([l, c, h]))))
}
