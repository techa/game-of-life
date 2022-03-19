export function randomRange(num: number, num2: number): number {
	const max = num > num2 ? num : num2
	const min = num > num2 ? num2 : num
	return min + Math.random() * (max - min)
}
export function randomInt(num: number, num2 = 0): number {
	return randomRange(num, num2) | 0
}
