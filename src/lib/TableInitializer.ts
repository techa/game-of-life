import { Array2d } from '../utils/Array2d.js'
import { randomInt } from '../utils/random.js'
import { Cell, type LifeGame } from './LifeGame.js'

export enum AreaPoint {
	topLeft,
	topRight,
	bottomLeft,
	bottomRight,
}

export interface TableInitializer {
	randomAreaColumns: number
	randomAreaRows: number
	area: number
	points: Array2d<number>
	areaInit(): void
	isPointEdge(i: number): boolean
	pointDirectionClass(i: number): string

	randomValue(x: number, y: number): number
	random(x: number, y: number): number

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
			this.areaInit()
			return this
		}

		insert(table: Cell[][]) {
			this.isRandom = false
			super.insert(table)
		}

		randomAreaColumns = 1
		randomAreaRows = 1
		get area() {
			return this.randomAreaColumns * this.randomAreaRows
		}

		/**
		 * #=inputPoint,
		 * ## randomAreaColumns=1, randomAreaRows=1
		 * ```
		 * #-------#
		 * |   |   |
		 * |---|---|
		 * |   |   |
		 * #-------#
		 * ```
		 * ## randomAreaColumns=2, randomAreaRows=2
		 * ```
		 * #------#------#
		 * |   |  |  |   |
		 * |---|--|--|---|
		 * |   |  |  |   |
		 * #---|--#--|---#
		 * |   |  |  |   |
		 * |---|--|--|---|
		 * |   |  |  |   |
		 * #------#------#
		 * ```
		 */
		points = new Array2d(
			this.randomAreaColumns + 1,
			this.randomAreaRows + 1,
			50,
		)
		areaInit() {
			this.points = new Array2d(
				this.randomAreaColumns + 1,
				this.randomAreaRows + 1,
				50,
			)
		}
		isPointEdge(i: number): boolean {
			const x = this.points.getX(i)
			const y = this.points.getY(i)
			return (
				!x ||
				!y ||
				x === this.randomAreaColumns ||
				y === this.randomAreaRows
			)
		}
		pointDirectionClass(i: number) {
			const x = this.points.getX(i)
			const y = this.points.getY(i)
			let cls = ''
			if (x === 0) {
				cls += 'justify-start '
			} else if (x === this.randomAreaColumns) {
				cls += 'justify-end '
			} else {
				cls += 'justify-center '
			}

			if (y === 0) {
				cls += 'items-start '
			} else if (y === this.randomAreaRows) {
				cls += 'items-end '
			} else {
				cls += 'items-center '
			}

			return cls
		}

		getPointByArea(x: number, y: number, areaPoint: AreaPoint) {
			x -=
				areaPoint === AreaPoint.bottomRight ||
				areaPoint === AreaPoint.topRight
					? 1
					: 0
			y -=
				areaPoint === AreaPoint.bottomLeft ||
				areaPoint === AreaPoint.bottomRight
					? 1
					: 0
			return this.points.getValue({ x, y })
		}

		randomValue(x: number, y: number): number {
			const { floor, ceil } = Math
			const dx = (x / this.columns) * this.randomAreaColumns
			const dy = (y / this.rows) * this.randomAreaRows

			const ap = this.points
			const x0y0 = ap.getValue({ x: floor(dx), y: floor(dy) }) as number
			const x1y0 = ap.getValue({ x: ceil(dx), y: floor(dy) }) as number
			const x0y1 = ap.getValue({ x: floor(dx), y: ceil(dy) }) as number
			const x1y1 = ap.getValue({ x: ceil(dx), y: ceil(dy) }) as number
			const xy0 = x0y0 + (x1y0 - x0y0) * (dx % 1)
			const xy1 = x0y1 + (x1y1 - x0y1) * (dx % 1)

			const xy = xy0 + (xy1 - xy0) * (dy % 1)

			return +xy.toFixed(2) / 100
		}

		random(x: number, y: number): number {
			return +(Math.random() < this.randomValue(x, y))
		}

		randomInit(dirX?: 'center' | 'edge', dirY?: 'center' | 'edge') {
			for (let y = 0; y < this.rows; y++) {
				for (let x = 0; x < this.columns; x++) {
					if (this.table[y][x] >= 0) {
						this.table[y][x] = this.#randomCorrection(
							x,
							y,
							dirX,
							dirY,
						)
					}
				}
			}
			this.init(this.table)
			this.isRandom = true
		}

		#randomCorrection(
			x: number,
			y: number,
			dirX?: 'center' | 'edge',
			dirY?: 'center' | 'edge',
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
			const minX = this.rows / dev / 3 - 1
			const minY = this.rows / dev / 3 - 1
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
