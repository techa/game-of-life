const enum Direction {
	TOP = 'top',
	LEFT = 'left',
	RIGHT = 'right',
	BOTTOM = 'bottom',
}

export const Array2dInitials = {
	INDEX0: Symbol(),
	INDEX1: Symbol(),
}

export type PositionXY = { x: number; y: number }
export type Array2dTarget = number | PositionXY
export type Array2dIndexs = { x: number; y: number; i: number }

export type Array2dmapCallbackFn<T> = (
	value: T,
	indexs: Array2dIndexs,
	arr?: T[],
) => T

export interface Array2dOptions {
	// initial?: T
	edgeLoop?: boolean
}

export const array2dOptions = {
	edgeLoop: false,
}

export class Array2d<T> {
	values: T[] = []
	columns: number
	rows: number
	get length() {
		return this.columns * this.rows
	}
	toJSON() {
		return this.get2d()
	}

	initial?: T

	options: Required<Array2dOptions> = {} as Required<Array2dOptions>

	constructor(width: number, height: number, initial?: T)
	constructor(array: T[][])
	constructor(width: number | T[][], height?: number, initial?: T) {
		if (typeof width === 'number') {
			if (initial !== undefined) {
				for (let i = 0; i < width * (height as number); i++) {
					this.values[i] = initial
				}
			}
			this.columns = width
			this.rows = height as number
			this.initial = initial
		} else {
			this.columns = width[0].length
			this.rows = width.length
			this.values = width.flat()
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

	get(x: number, y: number): T {
		return this.values[y * this.columns + x]
	}

	getValue(target: PositionXY, edgeLoop?: boolean): T | undefined
	getValue(i: number, edgeLoop?: boolean): T | undefined
	getValue(target: Array2dTarget, edgeLoop?: boolean): T | undefined {
		const indexmode = typeof target === 'number'
		let x = indexmode ? this.getX(target) : target.x
		let y = indexmode ? this.getY(target) : target.y

		const xl = this.columns
		const yl = this.rows
		if (edgeLoop || (edgeLoop === undefined && this.options.edgeLoop)) {
			x = x < 0 ? xl + x : x >= xl ? x % xl : x
			y = y < 0 ? yl + y : y >= yl ? y % yl : y
			return this.values[y * this.columns + x]
		}
		if (x < 0 || y < 0 || x >= xl || y >= yl) {
			return undefined
		}
		return this.values[y * this.columns + x]
	}

	setValue(target: Array2dTarget, value: T): void {
		if (typeof target !== 'number') {
			target = target.y * this.columns + target.x
		}
		this.values[target] = value
	}

	clone() {
		const arr = new Array2d<T>(this.columns, this.rows).setOptions(
			this.options,
		)
		arr.values = this.values.slice()
		return arr
	}

	forEach(cb: (value: T, indexs: Array2dIndexs, arr?: T[]) => void) {
		for (let i = 0; i < this.rows * this.columns; i++) {
			cb(
				this.getValue(i) as T,
				{ x: this.getX(i), y: this.getY(i), i },
				this.values as T[],
			)
		}
	}

	each(cb: (value: T, indexs: Array2dIndexs, arr?: T[]) => T): this {
		const arr = new Array2d<T>(this.columns, this.rows)
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

	map<U>(cb: (value: T, indexs: Array2dIndexs, arr?: T[]) => U): Array2d<U> {
		const arr = new Array2d<U>(this.columns, this.rows)
		for (let i = 0; i < this.rows * this.columns; i++) {
			arr.setValue(
				i,
				cb(
					this.getValue(i) as T,
					{
						x: this.getX(i),
						y: this.getY(i),
						i,
					},
					this.values,
				),
			)
		}
		return arr
	}

	/**
	 * step1(Math.hypot(0,1)=1)
	 * ```
	 *  1    (0,-1)
	 * 1o1   (-1,0)(1,0)
	 *  1    (0,1)
	 * ```
	 * step2(Math.hypot(1,1)=1.4142)
	 * ```
	 * 101  (-1,-1)(1,-1)
	 * 0o0
	 * 101  (-1,1)(1,1)
	 * ```
	 * step3(Math.hypot(0,2)=2)
	 * ```
	 *   1     (0,-2)
	 *  000
	 * 10o01   (-2,0)(2,0)
	 *  000
	 *   1     (0,2)
	 * ```
	 * step4(Math.hypot(1,2)=2.23606797749979)
	 * ```
	 *  101
	 * 10001
	 * 00o00
	 * 10001
	 *  101
	 * ```
	 * step5(Math.hypot(2,2)=2.8284271247461903)
	 * ```
	 * 10001
	 * 00000
	 * 00o00
	 * 00000
	 * 10001
	 * ```
	 * step6(Math.hypot(0,3)=3)
	 * ```
	 *    1
	 *  00000
	 *  00000
	 * 100o001
	 *  00000
	 *  00000
	 *    1
	 * ```
	 * step7(Math.hypot(1,3)=3.1622776601683795)
	 * ```
	 *   101
	 *  00000
	 * 1000001
	 * 000o000
	 * 1000001
	 *  00000
	 *   101
	 * ```
	 * step8(Math.hypot(2,3)=3.605551275463989)
	 * ```
	 *  10001
	 * 1000001
	 * 0000000
	 * 000o000
	 * 0000000
	 * 1000001
	 *  10001
	 * ```
	 * step9(Math.hypot(2,3)=3.605551275463989)
	 * ```
	 *  10001
	 * 1000001
	 * 0000000
	 * 000o000
	 * 0000000
	 * 1000001
	 *  10001
	 * ```
	 * step10(Math.hypot(0,4)=4)
	 * ```
	 *     1
	 *   00000
	 *  0000000
	 *  0000000
	 * 1000o0001
	 *  0000000
	 *  0000000
	 *   00000
	 *     1
	 * ```
	 * step11(Math.hypot(1,4)=4.123105625617661)
	 * ```
	 *    101
	 *   00000
	 *  0000000
	 * 100000001
	 * 0000o0000
	 * 100000001
	 *  0000000
	 *   00000
	 *    101
	 * ```
	 * step11(Math.hypot(3,3)=4.242640687119285)
	 * ```
	 *  10001
	 * 1000001
	 * 0000000
	 * 000o000
	 * 0000000
	 * 1000001
	 *  10001
	 * ```
	 * @param cb
	 * @param target
	 */
	near(
		cb: (
			value: T,
			indexs?: { x: number; y: number; i: number },
		) => boolean | void,
		target: Array2dTarget = {
			x: ((this.columns - 1) / 2) | 0,
			y: ((this.rows - 1) / 2) | 0,
		},
	) {
		const indexmode = typeof target === 'number'
		const orix = indexmode ? this.getX(target) : target.x
		const oriy = indexmode ? this.getY(target) : target.y

		let step = 0
		let l = this.length

		let cell: { x: number; y: number; r: number } | undefined = {
			x: 0,
			y: 0,
			r: 0,
		}
		const stack = [cell]

		while (l && (cell = stack.pop())) {
			const x = orix + cell.x
			const y = oriy + cell.y
			const val = this.getValue({ x, y }, false)

			if (val !== undefined) {
				const res = cb(val, { x, y, i: this.getIndex(x, y) })
				l--

				if (res === true) {
					break
				}
			}

			if (cell.x + cell.y === step) {
				step++
				// 2, 1, 0, -1, -2
				for (let y = step; y >= -step; y--) {
					const x = step - Math.abs(y)
					const r = Math.hypot(x, y)
					if (x) {
						stack.push({ x, y, r })

						if ((!(x - y) && !(x + y === step)) || !y) {
							stack.push({ x: -x, y: -y, r })
						}
					}
					if (y) {
						stack.push({ x: -x, y, r })
					}
				}
				stack.sort((a, b) => b.r - a.r)
			}
		}
	}

	spiralDirectionsOrder: Direction[] = [
		Direction.LEFT,
		Direction.BOTTOM,
		Direction.RIGHT,
		Direction.TOP,
	]

	/**
	 *
	 * |----5-----
	 * | |--3--- |
	 * 4 2 T>1 | |
	 * | -2-<1 3 5
	 * ----4---- |
	 *           |
	 *  T="Target point"
	 * T,1,1,2,2,3,3,4,4,5,5,6...
	 *
	 * @param cb Stop loop when returns true
	 * @param x (optional) initial position-x
	 * @param y (optional) initial position-y
	 */
	spiral(
		cb: (
			value: T,
			indexs?: { x: number; y: number; i: number },
		) => boolean | void,
		target: Array2dTarget = {
			x: ((this.columns - 1) / 2) | 0,
			y: ((this.rows - 1) / 2) | 0,
		},
	) {
		const indexmode = typeof target === 'number'
		let x = indexmode ? this.getX(target) : target.x
		let y = indexmode ? this.getY(target) : target.y
		/**
		 * 0=left,1=down,2=right,3=up
		 */
		let direction = 0
		let step = 1
		let edge = 1
		let two = false

		let i = this.getIndex(x, y)

		let l = this.length

		while (l) {
			const val = this.getValue({ x, y }, false)
			if (val !== undefined) {
				const res = cb(val, { x, y, i })
				l--

				if (res === true) {
					break
				}
			}
			switch (this.spiralDirectionsOrder[direction]) {
				case Direction.LEFT:
					x += 1
					break
				case Direction.BOTTOM:
					y += 1
					break
				case Direction.RIGHT:
					x -= 1
					break
				case Direction.TOP:
					y -= 1
					break
			}

			if (step >= edge) {
				step = 0
				direction = ++direction % 4 // 4=spiralDirectionsOrder.length
				if (two) {
					edge++
				}
				two = !two
			}
			step++
			i = this.getIndex(x, y)
		}
	}

	equal(a: T, b: T): boolean {
		return a === b
	}

	/**
	 * * 0 = none check
	 * * 1 = checked but none-fill
	 * * 2 = checked and fill-true
	 */
	#fills!: Array2d<number>
	#fillOK(targetValue: T, position: PositionXY): boolean {
		const val = this.getValue(position)
		const notCheck = !this.#fills.getValue(position)
		const bool = val && notCheck && this.equal(targetValue, val)
		if (notCheck) {
			this.#fills.setValue(position, 1)
		}
		return !!bool
	}

	/**
	 * fill by Stack algorithm
	 * @param target index or {x, y}
	 * @param cb
	 */
	fillPaint(
		target: Array2dTarget,
		cb: (value: T, indexs: Array2dIndexs, arr?: T[]) => T | undefined,
	): this {
		const timeName = 'fill by Stack algorithm'
		console.time(timeName)

		if (typeof target !== 'number') {
			target = target.y * this.columns + target.x
		}
		const targetValue = this.values[target]

		this.#fills = new Array2d(this.columns, this.rows, 0)

		let cell: { x: number; y: number } | undefined = {
			x: target % this.columns,
			y: (target / this.columns) | 0,
		}

		const stack: (typeof cell)[] = [cell]

		while ((cell = stack.pop())) {
			const { x, y } = cell

			this.#fills.setValue(cell, 2)

			const positions = [
				{ x, y: y - 1 },
				{ x, y: y + 1 },
				{ x: x + 1, y },
				{ x: x - 1, y },
			]
			for (const position of positions) {
				if (this.#fillOK(targetValue, position)) {
					stack.push(position)
				}
			}
		}

		this.#fills.forEach((fill, { x, y, i }) => {
			if (fill === 2) {
				const res = cb(this.values[i], { x, y, i }, this.values)
				if (res !== undefined) {
					this.values[i] = res
				}
			}
		})

		console.timeEnd(timeName)
		return this
	}

	rotate(clock = true) {
		const table = this.get2d()
		;[this.rows, this.columns] = [this.columns, this.rows]

		this.values = []

		for (let y = 0; y < this.rows; y++) {
			for (let x = 0; x < this.columns; x++) {
				this.values[y * this.columns + x] =
					table[this.columns - x - 1][y]
			}
		}
	}

	sizing(columns: number, rows: number) {
		const table = this.get2d()
		if (this.rows > rows) {
			table.length = rows
		} else {
			for (let y = 0; y < rows; y++) {
				if (!table[y]) table[y] = []
				if (this.columns > columns) {
					table[y].length = columns
				} else {
					for (let x = 0; x < columns; x++) {
						table[y][x] ??= this.initial as T
					}
				}
			}
		}
		this.columns = table[0].length
		this.rows = table.length
		this.values = table.flat()
	}

	addRows(row = this.rows) {
		if (row < 0) {
			row += this.rows
		}
		for (let x = 0; x < this.columns; x++) {
			this.values.splice(this.getIndex(x, row), 0, this.initial as T)
		}
		this.rows += 1
	}
	removeRows(row = -1) {
		if (row < 0) {
			row += this.rows
		}
		for (let x = this.columns - 1; x >= 0; x--) {
			this.values.splice(this.getIndex(x, row), 1)
		}
		this.rows -= 1
	}
	addColumns(columns = this.columns) {
		if (columns < 0) {
			columns += this.columns
		}
		for (let y = this.rows - 1; y >= 0; y--) {
			this.values.splice(this.getIndex(columns, y), 0, this.initial as T)
		}

		this.columns += 1
	}
	removeColumns(columns = -1) {
		if (columns < 0) {
			columns += this.columns
		}
		for (let y = this.rows - 1; y >= 0; y--) {
			this.values.splice(this.getIndex(columns, y), 1)
		}
		this.columns -= 1
	}
}
