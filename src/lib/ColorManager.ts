import { lch2rgb } from '../utils/lch2rgb.js'
import type { Cell, LifeGame } from './LifeGame.js'

type RGB_HEX = string

export const enum TonePattern {
	Stairs,
	Rainbow,
	Gradation,
	Trace,
}

// export const TonePatternsStr ={
// 	[TonePattern.Gradation]: 'Gradation',
// 	[TonePattern.Trace]: 'Trace',
// 	[TonePattern.Rainbow]: 'Rainbow',
// 	[TonePattern.Stairs]: 'Stairs',
// }
export const TonePatternsStr = ['Stairs', 'Rainbow', 'Gradation', 'Trace']

export class ColorManager {
	life: LifeGame

	selectedColor!: RGB_HEX
	/**
	 * selectedColor's hue
	 */
	hue!: number
	/**
	 * トーン変化用変数
	 */
	_hue!: number

	/**
	 * LCH lightness
	 */
	readonly L = 90
	/**
	 * LCH chroma
	 */
	readonly C = 70

	colors!: string[]

	constructor(life: LifeGame) {
		this.life = life
		this.random()
	}

	random() {
		return this.setByHue((Math.random() * 360) | 0)
	}

	setByHue(hue: number): RGB_HEX {
		this.hue = this._hue = hue
		this.reset()
		this.selectedColor = lch2rgb(this.L, this.C, hue)
		return this.selectedColor
	}

	/**
	 * * `rules.cycle` が更新されたとき
	 * * `setByHue()` で `hue` が更新されたとき
	 * @see setByHue
	 */
	reset() {
		return (this.colors = [
			'transparent', // DEATH, TOMB
			this.selectedColor, // LIVE, UNDEAD
			// Generations colors...
		])
	}

	getIncHue(addhue: number): RGB_HEX {
		return lch2rgb(this.L, this.C, this.hue + addhue)
	}

	getColorHex(cell: Cell | number): RGB_HEX {
		if (cell < 0) {
			cell += 2
		}
		let color = this.colors[cell]
		if (!color) {
			color = this.next(/* Math.max(36, 360 / (this.life.cycle + 1)) */)
			this.colors.push(color)
			console.log(`%c${color}`, `color:${color};font-weight:bold;`)
		}
		return color
	}

	tonePattern: TonePattern = TonePattern.Rainbow
	next(): RGB_HEX {
		const count = this.colors.length - 1

		switch (this.tonePattern) {
			default:
			case TonePattern.Stairs: {
				const cycle = 5
				const toneRule = count % cycle
				return lch2rgb(
					toneRule === cycle ? this.L : this.L - 18 * toneRule,
					toneRule === cycle ? this.C : this.C - 7 * toneRule,
					(this._hue = !toneRule
						? (this._hue + 37) % 360
						: this._hue),
				)
			}
			case TonePattern.Rainbow: {
				return lch2rgb(
					this.L - 1 * count,
					this.C - 2 * count,
					(this._hue = (this._hue + 7) % 360),
				)
			}
			case TonePattern.Gradation:
				return lch2rgb(
					this.L - 2 * count,
					this.C - 1 * count,
					(this._hue = (this._hue + 1) % 360),
				)
			case TonePattern.Trace:
				return lch2rgb(
					this.L - 25,
					this.C - 25,
					(this._hue = (this._hue + 2) % 360),
				)
		}
	}
}
