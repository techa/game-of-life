import { randomInt } from '../utils/random.js'
import { Cell, type LifeGame } from './LifeGame.js'

export interface TableInitializer {
	randomInit(dirX?: 'center' | 'edge', dirY?: 'center' | 'edge'): void
	fillEdge(): void
	undeadInit(): void
}
// eslint-disable-next-line @typescript-eslint/no-redeclare
export function TableInitializer<T extends { new (...args: any[]): LifeGame }>(
	target: T,
) {
	return class extends target implements TableInitializer {
		isRandom = false

		init(table?: Cell[][]) {
			this.isRandom = false
			super.init(table)
			return this
		}

		insert(table: Cell[][]) {
			this.isRandom = false
			super.init(table)
		}

		randomInit(dirX?: 'center' | 'edge', dirY?: 'center' | 'edge') {
			for (let y = 0; y < this.rows; y++) {
				for (let x = 0; x < this.columns; x++) {
					this.table[y][x] = this.#randomCorrection(dirX, dirY, x, y)
				}
			}
			this.init(this.table)
			this.isRandom = true
		}

		#randomCorrection(
			dirX: 'center' | 'edge',
			dirY: 'center' | 'edge',
			x: number,
			y: number,
		) {
			let sinxy = 0
			const { PI, sin, random } = Math
			if (dirX === 'center') {
				sinxy += sin((x / this.columns) * PI) - 0.5
			} else if (dirX === 'edge') {
				sinxy += 1 - sin((x / this.columns) * PI) - 0.5
			}
			if (dirY === 'center') {
				sinxy += sin((y / this.rows) * PI) - 0.5
			} else if (dirY === 'edge') {
				sinxy += 1 - sin((y / this.rows) * PI) - 0.5
			}
			const CellLength = 2 as const
			return ((random() + sinxy / 5) * CellLength) | 0
		}

		fillEdge() {
			const dev = 5
			const minX = this.rows / dev / 3
			const minY = this.rows / dev / 3
			let max = randomInt(this.rows / dev, minY)
			for (let y = 0; y < max; y++) {
				this.table[y][0] = Cell.LIVE
			}
			max = randomInt(this.rows / dev, minY)
			for (let y = 0; y < max; y++) {
				this.table[y][this.columns - 1] = Cell.LIVE
			}
			max = this.rows - 1 - randomInt(this.rows / dev, minY)
			for (let y = this.rows - 1; y > max; y--) {
				this.table[y][0] = Cell.LIVE
			}
			max = this.rows - 1 - randomInt(this.rows / dev, minY)
			for (let y = this.rows - 1; y > max; y--) {
				this.table[y][this.columns - 1] = Cell.LIVE
			}

			//x
			max = randomInt(this.columns / dev, minX)
			for (let x = 0; x < max; x++) {
				this.table[0][x] = Cell.LIVE
			}
			max = randomInt(this.columns / dev, minX)
			for (let x = 0; x < max; x++) {
				this.table[this.rows - 1][x] = Cell.LIVE
			}
			max = this.columns - 1 - randomInt(this.columns / dev, minX)
			for (let x = this.columns - 1; x > max; x--) {
				this.table[0][x] = Cell.LIVE
			}
			max = this.columns - 1 - randomInt(this.columns / dev, minX)
			for (let x = this.columns - 1; x > max; x--) {
				this.table[this.rows - 1][x] = Cell.LIVE
			}
		}

		undeadInit() {
			for (let y = 0; y < this.rows; y++) {
				for (let x = 0; x < this.columns; x++) {
					if (
						x === ((this.columns / 2) | 0) ||
						y === ((this.rows / 2) | 0)
					) {
						this.table[y][x] = Cell.UNDEAD
					}
				}
			}
			this.init(this.table)
		}
	}
}
