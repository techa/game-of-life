import { colorStringToHsl } from '../utils/color.js'
import { lch2rgb } from '../utils/lch2rgb.js'
import type { Cell, LifeGame } from './LifeGame.js'

export class ColorManager {
	life: LifeGame
	hueIncr = 1

	selectedColor = 'white'
	hue: number
	lightness = 90
	chroma = 70

	colors: string[]

	constructor(life: LifeGame) {
		this.life = life
		this.hue = Math.random() * 360
		this.colors = [
			'transparent', // DEATH, TOMB
			this.setByHue(this.hue), // LIVE, UNDEAD
			// Generations colors...
		]
	}

	setColor(color: string) {
		this.selectedColor = color

		this.hueIncr = 1
		this.colors = [
			'transparent', // DEATH, TOMB
			color, // LIVE, UNDEAD
			// Generations colors...
		]
		return color
	}

	setByHue(hue: number, c = this.chroma, l = this.lightness) {
		this.hue = hue
		return this.setColor(lch2rgb(l, c, hue))
	}
	getIncHue(addhue: number, c = this.chroma, l = this.lightness) {
		return lch2rgb(l, c, this.hue + addhue)
	}

	get(cell: Cell | number) {
		if (cell < 0) {
			cell += 2
		}
		let color = this.colors[cell]
		if (!color) {
			color = this.next(
				this.colors[cell - 1] || this.colors[1],
				Math.max(36, 360 / (this.life.cycle + 1)),
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
