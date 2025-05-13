import { Grid2d } from '../../utils/grid2d/Grid2d.js'

export const enum Cell {
	TOMB = -2,
	UNDEAD,
	DEAD,
	LIVE,
}

export class Cells extends Grid2d {
	_getModify(val: number) {
		const max = 1 << this.options.uint
		return val >= max + -2 ? val - max : val
	}

	get population() {
		let population = 0
		this.state.values.forEach((cell) => {
			if (cell && cell !== Cell.TOMB) {
				population++
			}
		})
		return population
	}

	encode() {
		// 保存するのは初期配置だけなので
		// 0,1,-2,-1 を 0,1,2,3 に変換
		return super.encode((v) => (v === 254 ? 3 : v === 255 ? 2 : v))
	}

	decode(dataStr: string): [width: number, height: number, source: number[]] {
		const data = super.decode(dataStr)
		return [
			data[0],
			data[1],
			data[2].map((v) => (v === 3 ? -2 : v === 2 ? -1 : v)),
		]
	}

	/** ムーア近傍 */
	static moore = Object.freeze([
		[-1, -1],
		[0, -1],
		[1, -1], //
		[-1, 0],
		// [0,0],
		[1, 0], //
		[-1, 1],
		[0, 1],
		[1, 1], //
	])
	next(born: number[], survival: number[], cycle = 2) {
		const countMax = Math.max(...born, ...survival)
		const edge = this.options.edgeType || 0

		const newValues = new this.ArrClass(this.length)

		const { columns, rows } = this.state
		for (let y = 0; y < rows; y++) {
			for (let x = 0; x < columns; x++) {
				const index = y * columns + x
				const cell = this.state.values[index]

				// cell === UNDEAD or TOMB
				if (cell < 0) {
					newValues[index] = cell
					continue
				}

				let count = 0
				for (const [nx, ny] of Cells.moore) {
					const neighbour = this.getValue(
						{ x: x + nx, y: y + ny },
						edge,
					)

					if (
						(neighbour === Cell.LIVE ||
							neighbour === Cell.UNDEAD) &&
						countMax < ++count
					) {
						break
					}
				}

				newValues[y * columns + x] =
					(cell === Cell.DEAD && born.includes(count)) ||
					(cell === Cell.LIVE && survival.includes(count))
						? Cell.LIVE
						: // Generations
						// https://conwaylife.com/wiki/Generations
						cell >= 1
						? (cell + 1) % cycle
						: // default DEAD
						  Cell.DEAD
			}
		}

		return newValues
	}
}
