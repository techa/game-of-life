import { fromBase64, toBase64 } from './cellsBase64.js'

export type PositionXY = { x: number; y: number } | [x: number, y: number]
export type Grid2dTarget = number | PositionXY
export type Grid2dIndexs = { x: number; y: number; i: number }
export type Grid2dEachCallback = (
	value: number,
	indexs: Grid2dIndexs,
	that: Grid2d,
) => number | void

export interface Grid2dOptions {
	edgeType?: 0 | 1 | 'loop' | null
	/**
	 * Uint8Array or Uint16Array or Uint32Array
	 */
	uint?: 8 | 16 | 32
}

export const Grid2dOptions: Required<Grid2dOptions> = {
	edgeType: null,
	uint: 8,
}

export type UintArray = Uint8Array | Uint16Array | Uint32Array

export interface Grid2dState {
	columns: number
	rows: number
	values: UintArray
}

export class Grid2d {
	static is2d(grid: unknown): grid is unknown[][] {
		return grid instanceof Array && grid[0] instanceof Array
	}
	/** 配列全体が同じか比較 */
	static isSameArray(arr1: UintArray, arr2: UintArray): boolean {
		if (arr1.length !== arr2.length) return false
		return arr1.every((value, index) => value === arr2[index])
	}

	state!: Grid2dState
	options = Grid2dOptions
	ArrClass:
		| Uint8ArrayConstructor
		| Uint16ArrayConstructor
		| Uint32ArrayConstructor = Uint8Array
	setOptions(options: Grid2dOptions): this {
		Object.assign(this.options, options)
		switch (this.options.uint) {
			case 8:
			default:
				this.ArrClass = Uint8Array
				break
			case 16:
				this.ArrClass = Uint16Array
				break
			case 32:
				this.ArrClass = Uint32Array
				break
		}
		return this
	}

	constructor(options?: Grid2dOptions, state?: Grid2dState) {
		if (options) {
			this.setOptions(options)
		}
		if (state) {
			this.init(state)
		}
	}

	/**
	 *
	 * @exsamle ```
	 * const grid = new Grid2d()
	 * let state = $state(grif.initState({columns: 2, rows: 3}))
	 * ```
	 */
	initState(width: number, height: number, source?: number[]): Grid2dState
	initState(source: number[][]): Grid2dState
	initState(source: Grid2dState['values']): Grid2dState
	initState(
		columns: number | number[][] | Grid2dState['values'],
		rows?: number,
		values?: number[][] | number[],
	): Grid2dState {
		const state: Partial<Grid2dState> = {}
		if (typeof columns === 'number') {
			if (typeof rows === 'number') {
				state.columns = columns
				state.rows = rows
				state.values = values
					? new this.ArrClass(values.flat())
					: new this.ArrClass(columns * rows)
			} else {
				throw new Error(`Grid2d's' "rows" must be number`)
			}
		} else if (Grid2d.is2d(columns)) {
			state.columns = columns[0].length
			state.rows = columns.length
			state.values = new this.ArrClass(columns.flat())
		} else if (ArrayBuffer.isView(columns)) {
			state.columns = this.state.columns
			state.rows = this.state.columns
			state.values = columns
		} else {
			throw new Error(`Grid2d's' ${columns} invalid arguments`)
		}
		return state as Grid2dState
	}

	private initDone = false
	init(state: Grid2dState): this
	init(width: number, height: number, source?: number[]): this
	init(source: number[][]): this
	init(source: Grid2dState['values']): this
	init(
		columns: number | number[][] | Grid2dState['values'] | Grid2dState,
		rows?: number,
		values?: number[][] | number[],
	): this {
		if (this.initDone) {
			throw new Error(`init() is already done. use .setValues()`)
		}
		this.state =
			typeof columns === 'number' ||
			Grid2d.is2d(columns) ||
			ArrayBuffer.isView(columns)
				? this.initState(
						columns as number,
						rows as number,
						values as number[],
				  )
				: columns

		this.initDone = true
		return this
	}

	private _valuesEventListeners = new Set<
		(index: number | null, values: UintArray) => void
	>()

	/** **個別の値を変更してイベントを発火** */
	setValue(index: number, value: number) {
		if (this.state.values[index] === value) return this // 変更なしならスキップ

		this.state.values[index] = value
		this._triggerValuesEvent(index)

		return this
	}

	/** **全体の値を変更してイベントを発火** */
	setValues(newValues: UintArray) {
		if (Grid2d.isSameArray(this.state.values, newValues)) return this

		this.state.values = newValues
		this._triggerValuesEvent(null)

		return this
	}

	/** **イベントを発火せずに値を変更** */
	updateValues(newValues: UintArray) {
		this.state.values = newValues
		return this
	}

	get length() {
		return this.state.values.length
	}

	/** イベントリスナーを登録 */
	onValuesChange(
		callback: (index: number | null, values: UintArray) => void,
	) {
		this._valuesEventListeners.add(callback)
	}

	/** イベントリスナーを解除 */
	offValuesChange(
		callback: (index: number | null, values: UintArray) => void,
	) {
		this._valuesEventListeners.delete(callback)
	}

	/** 変更時に全リスナーへ通知 */
	private _triggerValuesEvent(index: number | null) {
		this._valuesEventListeners.forEach((callback) =>
			callback(index, this.state.values),
		)
	}

	get2d() {
		const arr2d = []
		for (let i = 0; i < this.state.rows; i++) {
			const start = i * this.state.columns
			arr2d.push([
				...this.state.values.slice(start, start + this.state.columns),
			])
		}
		return arr2d
	}

	getX(i: number): number {
		return i % this.state.columns
	}
	getY(i: number): number {
		return (i / this.state.columns) | 0
	}
	getIndex(x: number, y: number): number {
		return y * this.state.columns + x
	}

	getValue(target: Grid2dTarget): number
	getValue(target: Grid2dTarget, edgeType: 0 | 1 | 'loop'): number
	getValue(target: Grid2dTarget, edgeType: null): number | null
	getValue(
		target: Grid2dTarget,
		edgeType = this.options.edgeType,
	): number | null {
		const indexmode = typeof target === 'number'
		let x = indexmode
			? this.getX(target)
			: 'x' in target
			? target.x
			: target[0]
		let y = indexmode
			? this.getY(target)
			: 'y' in target
			? target.y
			: target[1]

		const xl = this.state.columns
		const yl = this.state.rows
		//  Out of range of 2D table
		if (x < 0 || y < 0 || x >= xl || y >= yl) {
			if (edgeType === 'loop') {
				x = x < 0 ? xl + x : x >= xl ? x % xl : x
				y = y < 0 ? yl + y : y >= yl ? y % yl : y
			} else {
				return edgeType
			}
		}

		return this._getModify(this.state.values[y * this.state.columns + x])
	}

	_getModify(value: number) {
		return value
	}

	clone(): this {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return new (this.constructor as any)(this.options).init(
			this.state.columns,
			this.state.rows,
			this.state.values,
		)
	}

	clear() {
		this.state.values = new this.ArrClass(this.length)
		return this
	}

	each(callback: Grid2dEachCallback) {
		this.state.values.forEach((_, i) => {
			const result = callback(
				this.getValue(i),
				{ x: this.getX(i), y: this.getY(i), i },
				this,
			)
			if (result) {
				this.state.values[i] = result
			}
		})
		return this
	}

	/**
	 * 90-degree rotation
	 * @param clockwise
	 */
	rotate(clockwise = true): this {
		const newColumns = this.state.rows
		const newRows = this.state.columns
		const newValues = new this.ArrClass(newColumns * newRows)

		for (let y = 0; y < this.state.rows; y++) {
			for (let x = 0; x < this.state.columns; x++) {
				const newX = clockwise ? this.state.rows - 1 - y : y
				const newY = clockwise ? x : this.state.columns - 1 - x
				newValues[newY * newColumns + newX] =
					this.state.values[y * this.state.columns + x]
			}
		}

		this.state.columns = newColumns
		this.state.rows = newRows
		this.setValues(newValues)

		return this
	}

	sizing(columns: number, rows: number, top = false, left = false): this {
		if (columns <= 1 || rows <= 1) return this // サイズ制約

		const table = this.get2d()

		// **行の調整**
		while (table.length < rows) {
			const newRow = Array(columns).fill(0)
			top ? table.unshift(newRow) : table.push(newRow) // 追加
		}
		while (table.length > rows) {
			top ? table.shift() : table.pop() // 削除
		}

		// **列の調整**
		table.forEach((row) => {
			while (row.length < columns) {
				left ? row.unshift(0) : row.push(0) // 追加
			}
			while (row.length > columns) {
				left ? row.shift() : row.pop() // 削除
			}
		})

		// サイズを更新
		this.state.columns = columns
		this.state.rows = rows
		this.setValues(new this.ArrClass(table.flat()))

		return this
	}

	/**
	 * データを中央に挿入
	 *
	 * 必要なら.clear()すること
	 */
	insert(width: number, height: number, source: number[]) {
		// 必要ならグリッドサイズを拡張
		const newColumns = Math.max(this.state.columns, width)
		const newRows = Math.max(this.state.rows, height)

		// 中央配置のためのオフセット計算
		const offsetX = Math.floor((newColumns - width) / 2)
		const offsetY = Math.floor((newRows - height) / 2)

		// リサイズ
		this.sizing(newColumns, newRows)

		// **データの挿入**
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const newX = x + offsetX
				const newY = y + offsetY

				this.state.values[newY * newColumns + newX] =
					source[y * width + x]
			}
		}

		return this
	}

	encode(callback?: (value: number, i: number) => number): string {
		return (
			`${this.state.columns}.${this.state.rows}.` +
			toBase64(
				callback ? this.state.values.map(callback) : this.state.values,
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

	// borders: UintArray
	createBorderCells() {
		const borders = {
			top: new this.ArrClass(this.state.columns),
			bottom: new this.ArrClass(this.state.columns),
			left: new this.ArrClass(this.state.rows),
			right: new this.ArrClass(this.state.rows),
		}
	}

	/**
	 *     0,1,2,3,4,5,6,
	 * 5,l,t,t,t,t,t,t,t
	 * 4,l,            r,0,
	 * 3,l,            r,1,
	 * 2,l,            r,2,
	 * 1,l,            r,3,
	 * 0,l,            r,4
	 *  ,b,b,b,b,b,b,b,r,5
	 *   6,5,4,3,2,1,0
	 */
	getBorderValue(x: number, y: number) {
		const borders = {
			top: new this.ArrClass(this.state.columns),
			bottom: new this.ArrClass(this.state.columns),
			left: new this.ArrClass(this.state.rows),
			right: new this.ArrClass(this.state.rows),
		}
		if (x >= 0 || x < this.state.columns || y >= 0 || y < this.state.rows) {
			return this.getValue([x, y])
		}

		/**
		 * l,t,t,t,t,t,t,t
		 */
		if (y < 0) {
			return borders.top[x]
		}
		if (y >= this.state.rows) {
			return borders.bottom[this.state.rows - x]
		}
		if (x < 0) {
			return borders.right[x]
		}
		if (x >= this.state.columns) {
			return borders.left[this.state.columns - x]
		}
		// if (x<0) {

		// }
	}
}
