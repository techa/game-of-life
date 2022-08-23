import { randomInt } from '../utils/random.js'
import { ticker, type Canceler } from '../utils/ticker.js'
import { EventDispatcher, type EventHandler } from '../utils/EventDispatcher.js'
import { TableInitializer } from './TableInitializer.js'

type Numbers = number | ''
export type Rule = `${Numbers}/${Numbers}` | `B${Numbers}/S${Numbers}`

// https://conwaylife.com/wiki/List_of_Life-like_cellular_automata
export const rules: Map<string, Rule> = new Map([
	["Conway's Life", 'B3/S23'],
	['HighLife', 'B36/S23'],
	['3-4 Life', 'B34/S34'],
	['B34/S45', 'B34/S45'], // step75:地形データ
	['B34/S458', 'B34/S458'],
	// https://en.wikipedia.org/wiki/Day_and_Night_(cellular_automaton)
	// ['Day & Night', 'B3678/S34678'],
	// ['Iceballs', 'B25678/S5678'], //大きな塊ができる
	// ['Life without death', 'B3/S012345678'], //インクのシミが広がっていくような
	// ['Mazectric', 'B3/S1234'], //迷路
	// ['Maze', 'B3/S12345'], //迷路
	// ['Coral', 'B3/S45678'], //step30:地形データ
	// // 塗りに対して使うと幅２マスの線になる
	// ['Assimilation', 'B345/S4567'], //アメーバみたいに変化しながら菱型になる.塗り
	// ['Long Life', 'B345/S5'], //縦横の線で構成される。大きさがあまり変化しない
	// ['Gems', 'B3457/S4568'], //アメーバみたいに変化しながら菱型になる
	// ['Gems Minor', 'B34578/S456'], //アメーバみたいに変化しながら菱型になる
	['Bugs', 'B3567/S15678'], //うごうご塗り潰し
	// ['Holstein', 'B35678/S4678'], //step40:地形データ!!
	// ['Diamoeba', 'B35678/S5678'], //step30:地形データ!!
	['Slow Blob', 'B367/S125678'], //雪が積もるかのような
	['Stains', 'B3678/S235678'],
	['Stains2', 'B3678/S2345678'],
	['Electrified Maze', 'B45/S12345'], //規則的な外形になろうとする
	// 塗りに対して使うと幅１マスの線になる
	['Walled cities', 'B45678/S2345'], //規則的な外形になろうとする
	['Vote 4/5', 'B4678/S35678'], //step30:地形データ!!
	['Vote1', 'B5678/S45678'], //step40:最強地形データ複雑
	['Vote2', 'B578/S45678'], //step20:最強地形データ複雑隙間多め
	['Vote3', 'B678/S45678'], //step40:最強地形データ隙間多め
	['Vote4', 'B678/S345678'],
	['g', 'B368/S245'],
	['cave', 'B5678/S345678'], //randomCorrection(5)系と相性よし
	['kaku', 'B478/S45678'], //randomCorrection(5)系と相性よし、step30で直線的
	['craggy', 'B4678/S45678'], //randomCorrection(5)系と相性よし、生成が速い。step10
])

export function parser(rule: Rule) {
	return rule
		.replace(/[^\d/]*/g, '')
		.split('/')
		.map((v) => v.split('').map((n) => +n))
}

export const enum Cell {
	DEATH,
	LIVE,
	UNDEAD,
}

export const enum LifeEvent {
	TABLE_UPDATE,
	START,
	STOP,
}

export interface LifeGame extends TableInitializer {}
@TableInitializer
export class LifeGame {
	#events = new EventDispatcher()
	emit(eventName: LifeEvent, event?: unknown): void {
		this.#events.emit(eventName, event)
	}
	on(eventName: LifeEvent, handler: EventHandler): void {
		this.#events.on(eventName, handler)
	}

	table: Cell[][]
	columns = 70
	rows = 70

	born: number[] = [3]
	survival: number[] = [2, 3]
	generation = 3

	edgeLoop = true
	edgeCell = Cell.DEATH

	stepCount = 0
	ticker: Canceler
	speed = 1
	speeds = [1, 2, 3, 4, 6, 12]

	isRandom = false

	init(table?: Cell[][]) {
		this.isRandom = false
		this.stepCount = 0
		if (table) {
			this.columns = table[0].length
			this.rows = table.length
			this.table = table
		} else {
			this.table = []
			for (let y = 0; y < this.rows; y++) {
				if (!this.table[y]) this.table[y] = []
				for (let x = 0; x < this.columns; x++) {
					this.table[y][x] = Cell.DEATH
				}
			}
		}
		this.emit(LifeEvent.TABLE_UPDATE)

		return this
	}

	setRule(rule: Rule) {
		if (/\d+\/\d+/.test(rule)) {
			// eslint-disable-next-line @typescript-eslint/no-extra-semi
			;[this.survival, this.born] = parser(rule)
		} else if (/B\d+\/S\d+/.test(rule)) {
			// eslint-disable-next-line @typescript-eslint/no-extra-semi
			;[this.born, this.survival] = parser(rule)
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
		this.emit(LifeEvent.TABLE_UPDATE)
	}

	rotate() {
		const table: Cell[][] = []
		;[this.rows, this.columns] = [this.columns, this.rows]
		for (let y = 0; y < this.rows; y++) {
			if (!table[y]) table[y] = []
			for (let x = 0; x < this.columns; x++) {
				table[y][x] = this.table[x][y]
			}
		}
		return (this.table = table)
	}

	insert(table: Cell[][]) {
		this.isRandom = false
		this.table = []
		this.stepCount = 0
		const rows = Math.max(table.length, this.rows)
		const columns = Math.max(table[0].length, this.columns)
		let sw = 0
		let sh = 0
		if (table.length < this.rows) {
			sh = ((this.rows - table.length) / 2) | 0
		}
		if (table[0].length < this.columns) {
			sw = ((this.columns - table[0].length) / 2) | 0
		}

		for (let y = 0; y < rows; y++) {
			if (!this.table[y]) this.table[y] = []
			for (let x = 0; x < columns; x++) {
				const val = table[y - sh]?.[x - sw]
				this.table[y][x] = val ?? Cell.DEATH
			}
		}
		this.emit(LifeEvent.TABLE_UPDATE)
		return this.table
	}

	tableSizing({ columns = this.columns, rows = this.rows }) {
		this.columns = columns
		this.rows = rows
		const yl = this.table.length
		if (yl > this.rows) {
			this.table.length = this.rows
		} else {
			for (let y = 0; y < this.rows; y++) {
				if (!this.table[y]) this.table[y] = []
				if (this.table[y].length > this.columns) {
					this.table[y].length = this.columns
				} else {
					for (let x = 0; x < this.columns; x++) {
						this.table[y][x] ??= this.isRandom
							? randomInt(2)
							: Cell.DEATH
					}
				}
			}
		}

		this.emit(LifeEvent.TABLE_UPDATE)
		return this.table
	}

	get survivalCount() {
		let count = 0
		for (let y = 0; y < this.rows; y++) {
			for (let x = 0; x < this.columns; x++) {
				if (this.table[y][x]) count++
			}
		}
		if (count < 1) {
			this.stop()
		}
		return count
	}

	at(x: number, y: number): Cell {
		const xl = this.columns
		const yl = this.rows
		if (this.edgeLoop) {
			x = x < 0 ? xl + x : x >= xl ? x % xl : x
			y = y < 0 ? yl + y : y >= yl ? y % yl : y
			return this.table[y][x]
		}
		if (x < 0 || y < 0 || x >= xl || y >= yl) {
			return this.edgeCell
		}
		return this.table[y][x]
	}

	step() {
		const table: Cell[][] = []
		const countMax = Math.max(...this.born, ...this.survival)

		for (let y = 0; y < this.rows; y++) {
			if (!table[y]) table[y] = []
			for (let x = 0; x < this.columns; x++) {
				if (this.table[y][x] === Cell.UNDEAD) {
					table[y][x] = Cell.UNDEAD
					continue
				}

				let count = 0
				moore: for (let _y = -1; _y <= 1; _y++) {
					for (let _x = -1; _x <= 1; _x++) {
						const neighbour = this.at(x + _x, y + _y)
						if (
							(_y || _x) &&
							(neighbour === Cell.LIVE ||
								neighbour === Cell.UNDEAD)
						) {
							count++
							if (countMax < count) {
								break moore
							}
						}
					}
				}

				const center = this.table[y][x]

				// if (center === Cell.DEATH && this.born.includes(count)) {
				// 	table[y][x] = Cell.LIVE
				// 	continue
				// }
				// if (center === Cell.LIVE) {
				// 	if (this.survival.includes(count)) {
				// 		table[y][x] = Cell.LIVE
				// 	} else {
				// 		// generation
				// 		table[y][x] = center + 1
				// 	}
				// 	continue
				// }
				// if (center >= 2) {
				// 	table[y][x] = (center + 1) % this.generation
				// 	if (table[y][x] >= this.generation) {
				// 		table[y][x] = Cell.DEATH
				// 	}
				// }

				if (
					(center === Cell.DEATH && this.born.includes(count)) ||
					(center === Cell.LIVE && this.survival.includes(count))
				) {
					table[y][x] = Cell.LIVE
				} else {
					table[y][x] = Cell.DEATH
				}
			}
		}
		this.table = table
		this.stepCount++

		this.emit(LifeEvent.TABLE_UPDATE)
		return table
	}

	start() {
		const cb = (count: number) => {
			if (!((count * this.speed) % 12 | 0)) {
				this.step()
			}
		}
		this.ticker = ticker(cb)
		this.emit(LifeEvent.START)
	}

	stop() {
		if (this.ticker) {
			this.ticker()
			this.ticker = null
		}
		this.emit(LifeEvent.STOP)
	}
}
