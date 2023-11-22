export const Array2dInitials = {
	INDEX0: Symbol(),
	INDEX1: Symbol(),
}

export type PositionXY = { x: number; y: number }
export type Array2dTarget = number | PositionXY
export type Array2dIndexs = { x: number; y: number; i: number }
export type Array2dEachCallback<T, R> = (
	value: T,
	indexs: Array2dIndexs,
	arr: T[],
) => R

export interface Array2dOptions {
	// initial?: T
	edgeLoop?: boolean
}

export const array2dOptions = {
	edgeLoop: false,
}

export function manhattanDistance(a: number[], b: number[]) {
	return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1])
}

export class Array2d<T> {
	values: T[] = []
	columns: number
	rows: number
	initial: T
	get length() {
		return this.columns * this.rows
	}
	toJSON() {
		return this.get2d()
	}

	options: Required<Array2dOptions> = {} as Required<Array2dOptions>

	constructor(width: number, height: number, initial: T)
	constructor(array: T[][], initial: T)
	constructor(width: number | T[][], height: number | T, initial?: T) {
		if (typeof width === 'number') {
			if (initial !== undefined) {
				for (let i = 0; i < width * (height as number); i++) {
					this.values[i] = initial
				}
			}
			this.columns = width
			this.rows = height as number
			this.initial = initial as T
		} else {
			this.columns = width[0].length
			this.rows = width.length
			this.values = width.flat()
			this.initial = height as T
		}
	}

	setOptions(options: Array2dOptions): this {
		this.options = {
			...array2dOptions,
			...options,
		}
		return this
	}

	insert2d(arr: T[][]): this {
		this.columns = arr[0].length
		this.rows = arr.length
		this.values = arr.flat()
		return this
	}

	/**
	 *
	 * @param original
	 * @param rows y, height
	 */
	static get2d<A>(original: A[], rows: number): A[][] {
		const arr2d: A[][] = []
		for (let y = 0; y < rows; y++) {
			arr2d[y] ||= [] as A[]
			const columns = original.length / rows
			for (let x = 0; x < columns; x++) {
				arr2d[y].push(original[y * columns + x])
			}
		}
		return arr2d
	}

	get2d() {
		const arr2d = []
		for (let i = 0; i < this.rows; i++) {
			const start = i * this.columns
			arr2d.push(this.values.slice(start, start + this.columns))
		}
		return arr2d
	}

	getX(i: number): number {
		return i % this.columns
	}
	getY(i: number): number {
		return (i / this.columns) | 0
	}
	getIndex(x: number, y: number): number {
		return y * this.columns + x
	}

	get(x: number, y: number, edgeLoop = this.options.edgeLoop): T {
		if (edgeLoop) {
			const xl = this.columns
			const yl = this.rows
			x = x < 0 ? xl + x : x >= xl ? x % xl : x
			y = y < 0 ? yl + y : y >= yl ? y % yl : y
		}
		return this.values[y * this.columns + x]
	}

	getValue(target: PositionXY, edgeLoop?: boolean): T | undefined
	getValue(i: number, edgeLoop?: boolean): T | undefined
	getValue(
		target: Array2dTarget,
		edgeLoop = this.options.edgeLoop,
	): T | undefined {
		const indexmode = typeof target === 'number'
		let x = indexmode ? this.getX(target) : target.x
		let y = indexmode ? this.getY(target) : target.y

		const xl = this.columns
		const yl = this.rows

		//  Out of range of 2D table
		if (x < 0 || y < 0 || x >= xl || y >= yl) {
			// enable Loop
			if (edgeLoop) {
				x = x < 0 ? xl + x : x >= xl ? x % xl : x
				y = y < 0 ? yl + y : y >= yl ? y % yl : y
			} else {
				return undefined
			}
		}
		return this.values[y * this.columns + x]
	}

	setValue(target: Array2dTarget, value: T): void {
		if (typeof target !== 'number') {
			target = target.y * this.columns + target.x
		}
		this.values[target] = value
	}

	clone(): this {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const arr = new (this.constructor as any)(
			this.columns,
			this.rows,
			this.initial,
		).setOptions(this.options)
		arr.values = this.values.slice()
		return arr
	}

	/**
	 * The original array remains unchanged.
	 * @param cb
	 */
	forEach(cb: Array2dEachCallback<T, void>) {
		for (let i = 0; i < this.rows * this.columns; i++) {
			cb(
				this.getValue(i) as T,
				{ x: this.getX(i), y: this.getY(i), i },
				this.values as T[],
			)
		}
	}

	/**
	 * The original array will be modified.
	 * @param cb
	 */
	each(cb: Array2dEachCallback<T, T>): this {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const arr = new (this.constructor as any)(
			this.columns,
			this.rows,
			this.initial,
		)
		for (let i = 0; i < this.rows * this.columns; i++) {
			const newVal = cb(
				this.getValue(i) as T,
				{ x: this.getX(i), y: this.getY(i), i },
				this.values as T[],
			)
			arr.setValue(i, newVal)
		}
		this.values = arr.values

		return this
	}

	// table manipulators

	/**
	 * 90-degree rotation
	 * @param clockwise
	 */
	rotate(clockwise = true) {
		const table = this.get2d()
		;[this.rows, this.columns] = [this.columns, this.rows]

		this.values = []

		for (let y = 0; y < this.rows; y++) {
			for (let x = 0; x < this.columns; x++) {
				this.values[y * this.columns + x] = clockwise
					? table[this.columns - x - 1][y]
					: table[x][this.rows - y - 1]
			}
		}
		return this
	}

	/**
	 * resize table
	 * @param columns width
	 * @param rows height
	 */
	sizing(columns: number, rows: number) {
		if (columns < 1 || rows < 1) {
			// return 0 length array
			this.columns = 0
			this.rows = 0
			this.values = []
			return this
		}

		const table = this.get2d()
		if (this.rows > rows) {
			// remove rows
			table.length = rows
		}
		for (let y = 0; y < rows; y++) {
			// remove columns
			if (this.columns > columns) {
				table[y].length = columns
			}

			// add rows
			if (!table[y]) table[y] = Array(columns).fill(this.initial)

			// add colmns
			for (let x = table[y].length; x < columns; x++) {
				table[y].push(this.initial)
			}
		}

		this.columns = table[0]?.length || 0
		this.rows = table.length
		this.values = table.flat()
		return this
	}

	addRows(row = this.rows) {
		if (row < 0) {
			row += this.rows
		}
		for (let x = 0; x < this.columns; x++) {
			this.values.splice(this.getIndex(x, row), 0, this.initial as T)
		}
		this.rows += 1
		return this
	}
	removeRows(row = -1) {
		if (row < 0) {
			row += this.rows
		}
		for (let x = this.columns - 1; x >= 0; x--) {
			this.values.splice(this.getIndex(x, row), 1)
		}
		this.rows -= 1
		return this
	}
	addColumns(columns = this.columns) {
		if (columns < 0) {
			columns += this.columns
		}
		for (let y = this.rows - 1; y >= 0; y--) {
			this.values.splice(this.getIndex(columns, y), 0, this.initial as T)
		}

		this.columns += 1
		return this
	}
	removeColumns(columns = -1) {
		if (columns < 0) {
			columns += this.columns
		}
		for (let y = this.rows - 1; y >= 0; y--) {
			this.values.splice(this.getIndex(columns, y), 1)
		}
		this.columns -= 1
		return this
	}
}
