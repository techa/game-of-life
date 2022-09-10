// [Global: Modifying Module](https://www.typescriptlang.org/docs/handbook/declaration-files/templates/global-modifying-module-d-ts.html)
declare global {
	// interface String {
	// 	format(...str: string[]): string
	// }
	// interface Number {
	// 	clamp(val1: number, val2: number): number
	// 	// round(digit: number): number

	// 	// abs(): number
	// }
	// interface Array<T> {
	// 	pick(): T
	// }
	// interface Set<T extends unknown> {
	// 	filter(cb: (item: T) => boolean): IterableIterator<T>
	// }
}

// for (const key in Math) {
// 	if (Object.prototype.hasOwnProperty.call(Math, key)) {
// 		const method = Math[key as keyof Math]
// 		if (typeof method === 'function') {
// 			Number.prototype[key] = function (
// 				this: number,
// 				...args: Parameters<typeof method>
// 			): ReturnType<typeof method> {
// 				return method(this, ...(args as [number]))
// 			}
// 		}
// 	}
// }

/**
 * Returns a number whose value is limited to the given range.
 *
 * @memberof JsExtensions
 * @param {number} min - The lower boundary.
 * @param {number} max - The upper boundary.
 * @returns {number} A number in the range (min, max).
 */
// Number.prototype.clamp = function (
// 	this: number,
// 	val1: number,
// 	val2 = 0,
// ): number {
// 	const min = val1 < val2 ? val1 : val2
// 	const max = val1 < val2 ? val2 : val1
// 	return this > max ? max : this > min ? this : min
// }

/**
 *
 * @memberof JsExtensions
 * @param {number} digit -
 * @returns {number}
 */
// Number.prototype.round = function (this: number, digit = 0): number {
// 	return +this.toFixed(digit)
// }

/**
 * Replaces %1, %2 and so on in the string to the arguments.
 *
 * @memberof JsExtensions
 * @param {string[]} str - ...args The objects to format.
 * @returns {string} A formatted string.
 */
// String.prototype.format = function (this: string, ...str: string[]): string {
// 	return this.replace(/%([1-9]\d*)/g, (_, n) => str[Number(n) - 1])
// }

// Array.prototype.pick = function <T>(this: T[]): T {
// 	const index = (Math.random() * this.length) | 0
// 	const val = this[index]
// 	this.splice(index, 1)
// 	return val
// }

export {}
