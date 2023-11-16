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

	points: Array2d<number>
	edgeRow: Cell[]
	edgeColumn: Cell[]
	areaInit(points: number[][]): void
	isPointEdge(i: number): boolean
	/**
	 *
	 * @param i
	 * @returns `justify-${'start'|'end'|'center'} items-${'start'|'end'|'center'}`
	 */
	pointDirectionClass(i: number): string
	isEdgeLoop(i: number): boolean

	getRandomPoint(target: number | { x: number; y: number }): number
	randomValue(x: number, y: number): number

	randomInit(): void
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

			if (!this.points) {
				this.areaInit([
					[50, 50],
					[50, 50],
				])
			}
			return this
		}

		insert(table: Cell[][]) {
			this.isRandom = false
			super.insert(table)
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
		points!: Array2d<number>
		get randomAreaRows() {
			return this.points.rows - 1
		}
		get randomAreaColumns() {
			return this.points.columns - 1
		}

		edgeRow: Cell[] = []
		edgeColumn: Cell[] = []

		areaInit(points: number[][]) {
			this.points = new Array2d(points)
			this.points.initial = 50
			this.edgeRow = Array(this.randomAreaRows).fill(this.edgeCell)
			this.edgeColumn = Array(this.randomAreaColumns).fill(this.edgeCell)
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

		#isEdgeLoopX(x: number, y: number): boolean {
			return (
				x === this.randomAreaColumns && this.edgeRow[y] === Cell.DEATH
			)
		}
		#isEdgeLoopY(x: number, y: number): boolean {
			return (
				y === this.randomAreaRows && this.edgeColumn[x] === Cell.DEATH
			)
		}
		isEdgeLoop(i: number): boolean {
			const x = this.points.getX(i)
			const y = this.points.getY(i)

			if (x === this.randomAreaColumns && y === this.randomAreaRows) {
				return (
					this.edgeColumn[x - 1] === Cell.DEATH ||
					this.edgeRow[y - 1] === Cell.DEATH
				)
			}

			return this.#isEdgeLoopX(x, y) || this.#isEdgeLoopY(x, y)
		}

		getRandomPoint(target: number | { x: number; y: number }): number {
			const indexmode = typeof target === 'number'
			const x = indexmode ? this.points.getX(target) : target.x
			const y = indexmode ? this.points.getY(target) : target.y

			if (x === this.randomAreaColumns && y === this.randomAreaRows) {
				return this.points.getValue({
					x: this.edgeColumn[x - 1] === Cell.DEATH ? 0 : x,
					y: this.edgeRow[y - 1] === Cell.DEATH ? 0 : y,
				}) as number
			}

			return this.points.getValue({
				x: this.#isEdgeLoopX(x, y) ? 0 : x,
				y: this.#isEdgeLoopY(x, y) ? 0 : y,
			}) as number
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

			/**
			 *
			 * ```
			 *      xy0
			 * x0y0--+---x1y0
			 * |     |   |
			 * |-----xy--|
			 * |     |   |
			 * x0y1--+---x1y1
			 *      xy1
			 * ```
			 */
			const x0y0 = this.getRandomPoint({ x: floor(dx), y: floor(dy) })
			const x1y0 = this.getRandomPoint({ x: ceil(dx), y: floor(dy) })
			const x0y1 = this.getRandomPoint({ x: floor(dx), y: ceil(dy) })
			const x1y1 = this.getRandomPoint({ x: ceil(dx), y: ceil(dy) })
			const xy0 = x0y0 + (x1y0 - x0y0) * (dx % 1)
			const xy1 = x0y1 + (x1y1 - x0y1) * (dx % 1)

			const xy = xy0 + (xy1 - xy0) * (dy % 1)

			return +xy.toFixed(2) / 100
		}

		randomInit() {
			for (let y = 0; y < this.rows; y++) {
				for (let x = 0; x < this.columns; x++) {
					if (this.table[y][x] >= 0) {
						this.table[y][x] = +(
							Math.random() < this.randomValue(x, y)
						)
					}
				}
			}
			this.init(this.table)
			this.isRandom = true
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
