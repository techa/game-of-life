import { Ticker } from '../utils/Ticker.js'
import { EventDispatcher, type EventHandler } from '../utils/EventDispatcher.js'
import { ruleParser, ruleReversal, type RuleString } from '$lib/rules.js'
import { Array2d } from '../utils/Array2d.js'

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

	cells = new Array2d(70, 70, Cell.DEATH)
	get columns() {
		return this.cells.columns
	}
	get rows() {
		return this.cells.rows
	}

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
		this.cells.forEach((cell) => {
			if (cell && cell !== Cell.TOMB) {
				population++
			}
		})
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

	init(cells?: typeof this.cells) {
		this.#generation = 0
		if (cells) {
			this.cells = cells
		} else {
			// clear()
			this.cells = new Array2d(this.columns, this.rows, Cell.DEATH)
		}

		if (this.population) {
			this.memory()
		}

		this.update()

		return this
	}

	memory() {
		return (this.#memory = JSON.stringify(this.cells.get2d()))
	}

	reset() {
		this.insert(JSON.parse(this.#memory))
	}

	insert(cells: Cell[][]) {
		this.cells = new Array2d(
			Math.max(cells[0].length, this.columns),
			Math.max(cells.length, this.rows),
			Cell.DEATH,
		)
		this.#generation = 0

		let sw = 0
		let sh = 0
		if (cells.length < this.rows) {
			sh = ((this.rows - cells.length) / 2) | 0
		}
		if (cells[0].length < this.columns) {
			sw = ((this.columns - cells[0].length) / 2) | 0
		}

		this.cells.each((cell, { x, y }) => {
			return cells[y - sh]?.[x - sw] ?? Cell.DEATH
		})

		this.update()
	}

	tableSizing(columns: number, rows: number) {
		this.cells.sizing(columns, rows)
		this.emit(LifeEvent.TABLE_UPDATE)
	}

	addRows(row = this.rows) {
		this.cells.addRows(row)
	}
	removeRows(row = -1) {
		this.cells.removeRows(row)
	}
	addColumns(columns = this.columns) {
		this.cells.addColumns(columns)
	}
	removeColumns(columns = -1) {
		this.cells.removeColumns(columns)
	}

	at(x: number, y: number): Cell {
		const xl = this.columns
		const yl = this.rows
		// edge loop
		if (!this.edgeCell) {
			x = x < 0 ? xl + x : x >= xl ? x % xl : x
			y = y < 0 ? yl + y : y >= yl ? y % yl : y
			return this.cells.get(x, y)
		}
		// edge TOMB or UNDEAD
		if (x < 0 || y < 0 || x >= xl || y >= yl) {
			return this.edgeCell
		}
		return this.cells.get(x, y)
	}

	step() {
		const countMax = Math.max(...this.#born, ...this.#survival)

		this.cells = this.cells.map((cell, { x, y }) => {
			if (cell === Cell.UNDEAD || cell === Cell.TOMB) {
				return cell
			}

			let count = 0
			moore: for (let _y = -1; _y <= 1; _y++) {
				for (let _x = -1; _x <= 1; _x++) {
					const neighbour = this.at(x + _x, y + _y)
					if (
						(_y || _x) &&
						(neighbour === Cell.LIVE || neighbour === Cell.UNDEAD)
					) {
						count++
						if (countMax < count) {
							break moore
						}
					}
				}
			}

			// Generations
			// https://conwaylife.com/wiki/Generations
			if (
				(cell === Cell.DEATH && this.#born.includes(count)) ||
				(cell === Cell.LIVE && this.#survival.includes(count))
			) {
				return Cell.LIVE
			} else if (cell >= 1) {
				return (cell + 1) % this.#cycle
			}
			return Cell.DEATH
		})

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
		const tableMemory = JSON.stringify(this.cells)
		if (this.autoStop && tableMemory === this.#tableMemory) {
			this.stop()
		} else {
			this.#tableMemory = tableMemory
			this.emit(LifeEvent.UPDATE)
		}
	}
}
