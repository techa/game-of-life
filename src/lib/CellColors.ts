import { colorStringToHsl } from '../utils/color.js'
import type { Cell } from './LifeGame.js'

export class CellColors {
	hueIncr = 1

	colors: string[]
	cycle = 2

	constructor(selectedColor: string, cycle: number) {
		this.hueIncr = 1
		this.colors = [
			'transparent', // DEATH, TOMB
			selectedColor, // LIVE, UNDEAD
		]
		this.cycle = cycle
	}

	get(cell: Cell | number) {
		if (cell < 0) {
			cell += 2
		}
		let color = this.colors[cell]
		if (!color) {
			color = this.next(
				this.colors[cell - 1] || this.colors[1],
				Math.max(35, 360 / (this.cycle + 1)),
			)
			this.colors.push(color)
			console.log(`%c${color}`, `color:${color};font-weight:bold;`)
		}
		return color
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
