import { Ticker } from '../utils/Ticker.js'
import { EventDispatcher, type EventHandler } from '../utils/EventDispatcher.js'
import { ruleParser, ruleReversal, type RuleString } from '$lib/rules.js'

export const enum Cell {
	TOMB = -2,
	UNDEAD,
	DEATH,
	LIVE,
}

export const enum LifeEvent {
	TABLE_UPDATE,
	UPDATE,
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

	table!: Cell[][]
	columns = 70
	rows = 70

	/**
	 * DEATH is loop
	 */
	edgeCell: Cell.TOMB | Cell.UNDEAD | Cell.DEATH = Cell.DEATH

	#born: number[] = [3]
	#survival: number[] = [2, 3]
	#cycle = 2
	get cycle() {
		return this.#cycle
	}

	get ruleString() {
		let str = `B${this.#born.join('')}/S${this.#survival.join('')}`
		if (this.#cycle > 2) {
			str += `/C${this.#cycle}`
		}
		return str as RuleString
	}

	setRule(rule: RuleString, reversal = false) {
		let rules: [number[], number[], number] | null = ruleParser(rule)
		if (!rules) {
			return this.ruleString
		}

		if (reversal) {
			rules = ruleReversal(...rules)
		}

		;[this.#born, this.#survival, this.#cycle] = rules
		return this.ruleString
	}

	#generation = 0
	get generation() {
		return this.#generation
	}
	get population() {
		let population = 0
		for (let y = 0; y < this.rows; y++) {
			for (let x = 0; x < this.columns; x++) {
				const cell = this.table[y][x]
				if (cell && cell !== Cell.TOMB) {
					population++
				}
			}
		}
		if (population < 1) {
			this.stop()
		}
		return population
	}

	#memory = '[[0]]'

	ticker!: Ticker

	#tpfsIndex = 1
	#tpfs = [48, 12, 4, 1]
	get tpf() {
		return this.#tpfs[this.#tpfsIndex]
	}
	get speed() {
		const tpf = this.ticker?.tpf || this.tpf
		// .at(-2) is meant to invert the initial value of #tpfsIndex.
		return this.#tpfs[0] / tpf / (this.#tpfs.at(-2) || 4)
	}
	get tpfsIndex() {
		return this.#tpfsIndex
	}
	set tpfsIndex(val: number) {
		const len = this.#tpfs.length
		while (val < 0) val += len // positive number
		if (val >= len) val %= len // loop

		this.#tpfsIndex = val
		if (this.ticker) {
			this.ticker.tpf = this.tpf
		}
	}

	#tableMemory = ''
	autoStop = true
	get isRunning() {
		return this.ticker?.running
	}

	init(table?: Cell[][]) {
		this.#generation = 0
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

		if (this.population) {
			this.memory()
		}

		this.update()

		return this
	}

	memory() {
		return (this.#memory = JSON.stringify(this.table))
	}

	reset() {
		this.insert(JSON.parse(this.#memory))
	}

	insert(table: Cell[][]) {
		this.table = []
		this.#generation = 0
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
						this.table[y][x] ??= Cell.DEATH
					}
				}
			}
		}
		this.emit(LifeEvent.TABLE_UPDATE)
	}

	at(x: number, y: number): Cell {
		const xl = this.columns
		const yl = this.rows
		// edge loop
		if (!this.edgeCell) {
			x = x < 0 ? xl + x : x >= xl ? x % xl : x
			y = y < 0 ? yl + y : y >= yl ? y % yl : y
			return this.table[y][x]
		}
		// edge TOMB or UNDEAD
		if (x < 0 || y < 0 || x >= xl || y >= yl) {
			return this.edgeCell
		}
		return this.table[y][x]
	}

	step() {
		const table: Cell[][] = []
		const countMax = Math.max(...this.#born, ...this.#survival)

		for (let y = 0; y < this.rows; y++) {
			if (!table[y]) table[y] = []
			for (let x = 0; x < this.columns; x++) {
				if (this.table[y][x] === Cell.UNDEAD) {
					table[y][x] = Cell.UNDEAD
					continue
				}
				if (this.table[y][x] === Cell.TOMB) {
					table[y][x] = Cell.TOMB
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

				// Generations
				// https://conwaylife.com/wiki/Generations
				if (
					(center === Cell.DEATH && this.#born.includes(count)) ||
					(center === Cell.LIVE && this.#survival.includes(count))
				) {
					table[y][x] = Cell.LIVE
				} else if (center >= 1) {
					table[y][x] = (center + 1) % this.#cycle
				} else {
					table[y][x] = Cell.DEATH
				}
			}
		}
		this.table = table
		this.#generation++

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
		const tableMemory = JSON.stringify(this.table)
		if (this.autoStop && tableMemory === this.#tableMemory) {
			this.stop()
		} else {
			this.#tableMemory = tableMemory
			this.emit(LifeEvent.UPDATE)
		}
	}
}
