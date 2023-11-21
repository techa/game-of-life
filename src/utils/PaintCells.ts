import {
	Array2d,
	type Array2dIndexs,
	type Array2dTarget,
	type PositionXY,
} from './Array2d.js'

const enum Direction {
	TOP = 'top',
	LEFT = 'left',
	RIGHT = 'right',
	BOTTOM = 'bottom',
}

export interface CellInfo<T> {
	x: number
	y: number
	r: number
	i: number
	value: T
}
export interface SearchTarget {
	x: number
	y: number
	edgeLoop?: boolean
}

// １まずはこの配列を作る
// const val = [
// 	0, 1, 3, 6, 9,13,18,23,29,36,43,51,
// 	1, 2, 4, 7,10,14,19,24,30,37,44,52,
// 	3, 4, 5, 8,12,15,20,26,31,38,45,53,
// 	6, 7, 8,11,13,17,22,27,33,40,47,55,
// 	9,10,12,13,16,21,25,30,35,41,49,57,
//    13,14,15,17,21,24,28,34,39,46,53,59,
//    18,19,20,22,25,28,32,38,43,50,56,61,
//    23,24,26,27,30,34,38,42,48,55,60,64,
//    29,30,31,33,35,39,43,48,54,58,63,66,
//    36,37,38,40,41,46,50,55,58,62,65,68,
//    43,44,45,47,49,53,56,60,63,65,67,69,
//    51,52,53,55,57,59,61,64,66,68,69,70,
// ]
/**
 *
	というかできればこれを作る
	const val = [
		 0,
		 1, 2,
		 3, 4, 5,
		 6, 7, 8,11,
		 9,10,12,13,16,
		13,14,15,17,21,24,
		18,19,20,22,25,28,32,
		23,24,26,27,30,34,38,42,
		29,30,31,33,35,39,43,48,54,
		36,37,38,40,41,46,50,55,58,62,
		43,44,45,47,49,53,56,60,63,65,67,
		51,52,53,55,57,59,61,64,66,68,69,70,
	]
 */
const yuk: number[][] = []
let sorted: number[] = []
for (let y = 0; y < 12; y++) {
	yuk[y] = []
	for (let x = 0; x < 12; x++) {
		const rr = +Math.hypot(x, y).toFixed(12)
		if (!sorted.includes(rr)) {
			sorted.push(rr)
		}
	}
}
// ソートを挟んでいるので全配列操作が一度で三回も必要
sorted = sorted.sort((a, b) => a - b)

for (let y = 0; y < 12; y++) {
	for (let x = 0; x < 12; x++) {
		const rr = +Math.hypot(x, y).toFixed(12)
		yuk[y].push(sorted.indexOf(rr))
	}
}

console.log('yuk', yuk)

/**
	この配列を事前に作っておき、活用する
	const val = [
		[0,1],
		[1,0],[-1,1],
		[1,0], [1,0], [-2,1],
		[1,0], [1,0], [-2,1], [-2,1],
		[1,0],[2,-1],     12,     13,   16,
		[1,0],    14,     15,     17,   21,24,
		18   ,    19,     20,     22,   25,28,32,
		23   ,    24,     26,     27,   30,34,38,42,
		29   ,    30,     31,     33,   35,39,43,48,54,
		36   ,    37,     38,     40,   41,46,50,55,58,62,
		43   ,    44,     45,     47,   49,53,56,60,63,65,67,
		51   ,    52,     53,     55,   57,59,61,64,66,68,69,70,
	]
 */

// const euc = []
// let row = 1
// let distance = 5

// for (let i = 0; i < row + 5; i++) {
// 	if (i < distance) {
// 	}
// 	euc.push([])
// }

export class PaintCells<T extends number = number> extends Array2d<T> {
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
	 * @param target default is cells table center
	 * @param breakCallback break if `true` is returned.
	 */
	near(
		target: number | SearchTarget = {
			x: ((this.columns - 1) / 2) | 0,
			y: ((this.rows - 1) / 2) | 0,
			edgeLoop: this.options.edgeLoop,
		},
		breakCallback?: (value: T, indexs: CellInfo<T>) => boolean | void,
	): T[] {
		const indexmode = typeof target === 'number'
		const orix = indexmode ? this.getX(target) : target.x
		const oriy = indexmode ? this.getY(target) : target.y
		// const edgeLoop = indexmode ? this.options.edgeLoop : target.edgeLoop

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
			const value = this.getValue({ x, y }, false)

			if (value !== undefined) {
				const res = breakCallback?.(value, {
					x,
					y,
					i: this.getIndex(x, y),
					r: Math.hypot(x, y),
					value,
				})
				l--

				if (res === true) {
					break
				}

				if (cell.x + cell.y === step) {
					step++
					// 2, 1, 0, -1, -2

					// step=1: y[1, 0, -1],            x[0, 1, 0]
					// step=2: y[2, 1, 0, -1, -2],     x[0, 1, 2 ,1, 0]
					// step=3:
					for (let y = step; y >= -step; y--) {
						const x = step - Math.abs(y)
						const r = Math.hypot(x, y)
						if (x) {
							stack.push({ x, y, r })

							if ((!(x - y) && !(x + y === step)) || !y) {
								stack.push({
									x: -x,
									y: -y,
									r,
								})
							}
						}
						if (y) {
							stack.push({
								x: -x,
								y,
								r,
							})
						}
					}
					stack.sort((a, b) => b.r - a.r)
				}
			}
		}

		return stack.map(({ x, y }) => this.get(x, y, true))
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
		target: Array2dTarget = {
			x: ((this.columns - 1) / 2) | 0,
			y: ((this.rows - 1) / 2) | 0,
		},
		breakCallback?: (value: T, indexs: Array2dIndexs) => boolean | void,
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
			const value = this.getValue({ x, y }, false)

			if (value !== undefined) {
				const res = breakCallback && breakCallback(value, { x, y, i })
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
}
