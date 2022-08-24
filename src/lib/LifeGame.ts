import { randomInt } from '../utils/random.js'
import { Ticker } from '../utils/Ticker.js'
import { EventDispatcher, type EventHandler } from '../utils/EventDispatcher.js'
import { ruleParser, type Rule } from '$lib/rules.js'

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
	ticker: Ticker

	#tpfsIndex = 1
	tpfs = [48, 12, 4, 1]
	get tpf() {
		return this.tpfs[this.#tpfsIndex]
	}
	get speed() {
		const tpf = this.ticker?.tpf || this.tpf
		// .at(-2) is meant to invert the initial value of #tpfsIndex.
		return this.tpfs[0] / tpf / this.tpfs.at(-2)
	}
	get tpfsIndex() {
		return this.#tpfsIndex
	}
	set tpfsIndex(val: number) {
		const len = this.tpfs.length
		while (val < 0) val += len // positive number
		if (val >= len) val %= len // loop

		this.#tpfsIndex = val
		if (this.ticker) {
			this.ticker.tpf = this.tpf
		}
	}

	#tableMemory = ''
	autoStop = true

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
		this.update()

		return this
	}

	setRule(rule: Rule) {
		if (/\d+\/\d+/.test(rule)) {
			// eslint-disable-next-line @typescript-eslint/no-extra-semi
			;[this.survival, this.born] = ruleParser(rule)
		} else if (/B\d+\/S\d+/.test(rule)) {
			// eslint-disable-next-line @typescript-eslint/no-extra-semi
			;[this.born, this.survival] = ruleParser(rule)
		}
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
		this.table = table
		this.update()
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
		this.update()
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

		this.update()
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

		this.update()
	}

	start() {
		this.ticker ??= new Ticker({
			tick: () => this.step(),
			tpf: this.tpf,
		})
		this.ticker.start()
		this.emit(LifeEvent.START)
	}

	stop() {
		this.ticker?.stop()
		this.emit(LifeEvent.STOP)
	}

	update() {
		const tableMemory = this.table.toString()
		if (this.autoStop && tableMemory === this.#tableMemory) {
			this.stop()
		} else {
			this.#tableMemory = tableMemory
			this.emit(LifeEvent.TABLE_UPDATE)
		}
	}
}
