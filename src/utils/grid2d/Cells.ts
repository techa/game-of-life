import { toBase64, fromBase64 } from './cellsBase64.js'
import { Grid2d } from './Grid2d.js'

export const enum Cell {
	TOMB = -2,
	UNDEAD,
	DEATH,
	LIVE,
}

export class Cells extends Grid2d {
	_getModify(val: number) {
		const max = 1 << this.options.uint
		return val >= max + -2 ? val - max : val
	}

	get population() {
		let population = 0
		this._values.forEach((cell) => {
			if (cell && cell !== Cell.TOMB) {
				population++
			}
		})
		return population
	}

	encode() {
		return (
			`${this.columns}.${this.rows}.` +
			toBase64(
				// 保存するのは初期配置だけ
				// 0,1,-2,-1 を 0,1,2,3 に変換
				this._values.map((v) => (v === 254 ? 3 : v === 255 ? 2 : v)),
			)
		)
	}

	decode(dataStr: string): [width: number, height: number, source: number[]] {
		const [width, height, base64, bitmin] = dataStr.split('.')
		return [
			parseInt(width),
			parseInt(height),
			fromBase64(base64 + '.' + bitmin),
		]
	}

	/** ムーア近傍 */
	static moore = [
		[-1, -1],
		[0, -1],
		[1, -1], //
		[-1, 0],
		// [0,0],
		[1, 0], //
		[-1, 1],
		[0, 1],
		[1, 1], //
	]
	next(born: number[], survival: number[], cycle = 2) {
		const countMax = Math.max(...born, ...survival)
		const edge = this.options.edgeType || 0

		const newValues = new this.ArrClass(this.length)

		for (let i = 0; i < this.length; i++) {
			const cell = this._values[i]
			const x = i % this.columns
			const y = (i / this.columns) | 0

			// cell === UNDEAD or TOMB
			if (cell < 0) {
				newValues[i] = cell
				continue
			}

			let count = 0
			for (const [_x, _y] of Cells.moore) {
				const neighbour = this.get({ x: x + _x, y: y + _y }, edge)

				if (neighbour === Cell.LIVE || neighbour === Cell.UNDEAD) {
					if (countMax < ++count) {
						break
					}
				}
			}

			// Generations
			// https://conwaylife.com/wiki/Generations
			newValues[y * this.columns + x] =
				(cell === Cell.DEATH && born.includes(count)) ||
				(cell === Cell.LIVE && survival.includes(count))
					? Cell.LIVE
					: cell >= 1
					? (cell + 1) % cycle
					: Cell.DEATH
		}

		return newValues
	}
}
