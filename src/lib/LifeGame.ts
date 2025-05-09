import { Ticker } from '../utils/Ticker.js'
import { EventDispatcher, type EventHandler } from '../utils/EventDispatcher.js'
import { ruleParser, ruleReversal, ruleToString } from '$lib/rules.js'
import { Cells } from './Cells.js'
import { ColorManager } from './ColorManager.js'

export const enum Cell {
	/**
	 * 墓場：永遠に死亡(DEATH)状態
	 */
	TOMB = -2,
	/**
	 * 不死身：永遠に生存(LIVE)状態
	 */
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
	colorManager: ColorManager
	constructor() {
		this.colorManager = new ColorManager(this)
	}
	/**
	 *
	 * @param cell default = Cell.LIVE
	 */
	getColor(cell = Cell.LIVE) {
		return this.colorManager.get(cell)
	}

	#events = new EventDispatcher()
	emit(eventName: LifeEvent, event?: unknown): void {
		this.#events.emit(eventName, event)
	}
	on(eventName: LifeEvent, handler: EventHandler): void {
		this.#events.on(eventName, handler)
	}

	cells = new Cells(70, 70, Cell.DEATH)
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
	/**
	 * min value is 2
	 */
	#cycle = 2
	get cycle() {
		return this.#cycle
	}

	get ruleString() {
		return ruleToString(this.#born, this.#survival, this.#cycle)
	}

	setRule(rule: string, reversal = false) {
		let rules
		try {
			rules = ruleParser(rule)
		} catch (error) {
			console.error(error)
			return this.ruleString
		}

		if (reversal) {
			rules = ruleReversal(...rules)
		}

		// eslint-disable-next-line @typescript-eslint/no-extra-semi
		;[this.#born, this.#survival, this.#cycle] = rules

		this.next()
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

	init(cells?: typeof this.cells | Cell[][]) {
		this.#generation = 0
		if (cells instanceof Cells) {
			this.cells = cells
		} else if (!cells) {
			// clear()
			this.cells = new Cells(this.columns, this.rows, Cell.DEATH)
		} else {
			this.cells = new Cells(cells, Cell.DEATH)
		}

		if (this.population) {
			this.memory()
		}

		this.update()

		return this
	}

	clear() {
		if (this.isRunning) {
			this.stop()
		}
		return this.init()
	}

	#memory = '[[0]]'

	memory() {
		return (this.#memory = JSON.stringify(this.cells.get2d()))
	}

	reset() {
		this.insert(JSON.parse(this.#memory))
	}

	/**
	 * load lexicon data
	 * @param data Cells#DataTemp
	 */
	lexicon(data: string) {
		this.insert(this.cells.decode(data, 1))
		this.memory()
	}

	insert(cells: Cell[][]) {
		this.cells = new Cells(
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

		this.cells.each((_cell, { x, y }) => {
			return cells[y - sh]?.[x - sw] ?? Cell.DEATH
		})

		this.update()
	}

	draw(target: { x: number; y: number }, value: Cell) {
		this.cells.setValue(target, value)
		if (this.population) {
			this.memory()
		}
		this.update()
	}

	tableSizing(columns: number, rows: number) {
		if (columns > 0 && rows > 0) {
			this.cells.sizing(columns, rows)
			this.emit(LifeEvent.TABLE_UPDATE)

			this.update()
		}
	}

	addRows(row = this.rows) {
		this.cells.addRows(row)
		this.update()
	}
	removeRows(row = -1) {
		this.cells.removeRows(row)
		this.update()
	}
	addColumns(columns = this.columns) {
		this.cells.addColumns(columns)
		this.update()
	}
	removeColumns(columns = -1) {
		this.cells.removeColumns(columns)
		this.update()
	}

	canStep = false
	nextCells: (Cell | number)[][] = []

	/**
	 * * init()/insert()/setRule()
	 *     * memory() initial data
	 *     * update()
	 *         * next()
	 * * step()
	 *     * update()
	 *         * next()
	 * * step()
	 *     * update()
	 *         * next()
	 */
	next() {
		const countMax = Math.max(...this.#born, ...this.#survival)

		const nextCells: (Cell | number)[][] = []

		this.cells.forEach((cell, { x, y }) => {
			if (!nextCells[y]) {
				nextCells[y] = []
			}
			if (cell < 0) {
				// if cell === UNDEAD or TOMB
				nextCells[y][x] = cell
				return
			}

			let count = 0
			moore: for (let _y = -1; _y <= 1; _y++) {
				for (let _x = -1; _x <= 1; _x++) {
					const neighbour =
						this.cells.getValue(
							{ x: x + _x, y: y + _y },
							!this.edgeCell,
						) || this.edgeCell

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
				nextCells[y][x] = Cell.LIVE
				return
			} else if (cell >= 1) {
				nextCells[y][x] = (cell + 1) % this.#cycle
				return
			}
			nextCells[y][x] = Cell.DEATH
		})

		this.#nextTable = JSON.stringify(nextCells)
		this.canStep = this.#tableMemory !== this.#nextTable
		return (this.nextCells = nextCells)
	}

	/**
	 * @returns canStep
	 */
	step() {
		if (this.autoStop && !this.canStep) {
			this.stop()
		} else {
			this.#generation++
			this.cells = new Cells(this.nextCells, 0)
			this.update(this.#nextTable)
		}
		return this.canStep
	}

	ticker!: Ticker

	#speedIndex = 0
	tickIntervals = [256, 128, 64, 32]
	speeds = [1, 2, 4, 8]

	get interval() {
		return this.tickIntervals[this.#speedIndex]
	}
	get speed() {
		return this.speeds[this.#speedIndex]
	}
	get speedIndex() {
		return this.#speedIndex
	}
	set speedIndex(val: number) {
		const len = this.tickIntervals.length
		while (val < 0) val += len // positive number
		if (val >= len) val %= len // loop

		this.#speedIndex = val
		if (this.ticker) {
			this.ticker.interval = this.interval
		}
	}

	#tableMemory = ''
	#nextTable = ''
	autoStop = true
	get isRunning() {
		return this.ticker?.running
	}

	start() {
		if (!this.population) {
			return
		}

		this.ticker ??= new Ticker({
			tick: () => this.step(),
			interval: this.interval,
		})
		this.ticker.start()

		if (this.generation === 0) {
			this.memory()
		}
		this.emit(LifeEvent.START)
	}

	stop() {
		this.ticker?.stop()
		this.emit(LifeEvent.STOP)
	}

	/**
	 * @used .init(), .insert(), .step()
	 */
	update(tableMemory = JSON.stringify(this.cells)) {
		this.#tableMemory = tableMemory
		this.next()
		this.emit(LifeEvent.UPDATE)
	}
}
