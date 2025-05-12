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
	 * Uint8Arra or Uint16Array or Uint32Array
	 */
	uint?: 8 | 16 | 32
}

export const Grid2dOptions: Required<Grid2dOptions> = {
	edgeType: null,
	uint: 8,
}

export type UintArray = Uint8Array | Uint16Array | Uint32Array

export class Grid2d {
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
			case 16:
				this.ArrClass = Uint16Array
			case 32:
				this.ArrClass = Uint32Array
		}
		return this
	}
	constructor(options?: Grid2dOptions) {
		if (options) {
			this.setOptions(options)
		}
	}

	_values!: UintArray

	/**
	 * width: `>1`
	 */
	columns!: number
	/***
	 * height: `>1`
	 */
	rows!: number

	init(width: number, height: number, source?: number[]): this
	init(source: number[][]): this
	init(source: typeof this._values): this
	init(
		width: number | number[][] | typeof this._values,
		height?: number,
		source?: number[],
	): this {
		if (typeof width === 'number') {
			if (typeof height === 'number') {
				this.columns = width
				this.rows = height
				this._values = source
					? new this.ArrClass(source)
					: new this.ArrClass(this.columns * this.rows)
			} else {
				throw new Error(`Grid2d's' "height" must be number`)
			}
		} else if (width instanceof Array) {
			const values = width
			this.columns = values[0].length
			this.rows = values.length
			this._values = new this.ArrClass(values.flat())
		} else if (width.length) {
			this._values = width
		} else {
			throw new Error(`Grid2d's' invalid arguments`)
		}
		return this
	}

	private _valuesEventListeners = new Set<
		(index: number | null, values: UintArray) => void
	>()

	// set values(newValues: Uint8Array | Uint16Array | Uint32Array) {
	// 	if (this._values && this._isSameArray(this._values, newValues)) return

	// 	this._values = newValues
	// 	this._triggerValuesEvent(null) // 全体変更
	// }

	// get values() {
	// 	return new Proxy(this._values, {
	// 		set: (target, property, value) => {
	// 			if (typeof property === 'string' && !isNaN(Number(property))) {
	// 				const index = Number(property)
	// 				if (target[index] === value) return true // 変更なしならスキップ

	// 				target[index] = value
	// 				this._triggerValuesEvent(index)
	// 			}
	// 			return true
	// 		},
	// 	})
	// }

	/** **個別の値を変更してイベントを発火** */
	setValue(index: number, value: number) {
		if (this._values[index] === value) return this // 変更なしならスキップ

		this._values[index] = value
		this._triggerValuesEvent(index)

		return this
	}

	/** **全体の値を変更してイベントを発火** */
	setValues(newValues: UintArray) {
		if (this._values && this._isSameArray(this._values, newValues))
			return this

		this._values = newValues
		this._triggerValuesEvent(null)

		return this
	}

	/** **イベントを発火せずに値を変更** */
	updateValues(newValues: UintArray) {
		this._values = newValues
		return this
	}

	get length() {
		return this._values.length
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
			callback(index, this._values),
		)
	}

	/** 配列全体が同じか比較 */
	private _isSameArray(arr1: UintArray, arr2: UintArray): boolean {
		if (arr1.length !== arr2.length) return false
		return arr1.every((value, index) => value === arr2[index])
	}

	get2d() {
		const arr2d = []
		for (let i = 0; i < this.rows; i++) {
			const start = i * this.columns
			arr2d.push([...this._values.subarray(start, start + this.columns)])
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

	get(target: Grid2dTarget): number
	get(target: Grid2dTarget, edgeType: 0 | 1 | 'loop'): number
	get(target: Grid2dTarget, edgeType: null): number | null
	get(target: Grid2dTarget, edgeType = this.options.edgeType): number | null {
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

		const xl = this.columns
		const yl = this.rows
		//  Out of range of 2D table
		if (x < 0 || y < 0 || x >= xl || y >= yl) {
			if (edgeType === 'loop') {
				x = x < 0 ? xl + x : x >= xl ? x % xl : x
				y = y < 0 ? yl + y : y >= yl ? y % yl : y
			} else {
				return edgeType
			}
		}

		return this._getModify(this._values[y * this.columns + x])
	}

	_getModify(value: number) {
		return value
	}

	clone(): this {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return new (this.constructor as any)(this.options).init(
			this.columns,
			this.rows,
			this._values,
		)
	}

	clear() {
		this._values = new this.ArrClass(this.length)
		return this
	}

	each(callback: Grid2dEachCallback) {
		this._values.forEach((_, i) => {
			const result = callback(
				this.get(i),
				{ x: this.getX(i), y: this.getY(i), i },
				this,
			)
			if (result) {
				this._values[i] = result
			}
		})
		return this
	}

	/**
	 * 90-degree rotation
	 * @param clockwise
	 */
	rotate(clockwise = true): this {
		const newColumns = this.rows
		const newRows = this.columns
		const newValues = new this.ArrClass(newColumns * newRows)

		for (let y = 0; y < this.rows; y++) {
			for (let x = 0; x < this.columns; x++) {
				const newX = clockwise ? this.rows - 1 - y : y
				const newY = clockwise ? x : this.columns - 1 - x
				newValues[newY * newColumns + newX] =
					this._values[y * this.columns + x]
			}
		}

		this.columns = newColumns
		this.rows = newRows
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
		this.columns = columns
		this.rows = rows
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
		const newColumns = Math.max(this.columns, width)
		const newRows = Math.max(this.rows, height)

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

				this._values[newY * newColumns + newX] = source[y * width + x]
			}
		}

		return this
	}
}
