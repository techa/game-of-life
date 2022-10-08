import { writable, type Writable } from 'svelte/store'
import { LifeGame } from '$lib/LifeGame.js'
import { TableTransform } from '$lib/TableTransform.js'
import { TableInitializer } from '$lib/TableInitializer.js'

interface LifeGameEx extends TableTransform, TableInitializer {}
@TableTransform
@TableInitializer
class LifeGameEx extends LifeGame {}
export const life = new LifeGameEx().init()

export const table = writable(life.table)

export const columns: Writable<typeof life.columns> = (() => {
	const { subscribe, set, update } = writable(life.columns)
	return {
		subscribe,
		update,
		set: (columns: typeof life.columns) => {
			set((life.columns = columns))
		},
	}
})()

export const rows: Writable<typeof life.rows> = (() => {
	const { subscribe, set, update } = writable(life.rows)
	return {
		subscribe,
		update,
		set: (rows: typeof life.rows) => {
			set((life.rows = rows))
		},
	}
})()

export const edgeCell: Writable<typeof life.edgeCell> = (() => {
	const { subscribe, set, update } = writable(life.edgeCell)
	return {
		subscribe,
		update,
		set: (edgeCell: typeof life.edgeCell) => {
			set((life.edgeCell = edgeCell > 0 ? -2 : edgeCell % -3))
		},
	}
})()

export const generation = writable(life.generation)
export const population = writable(life.population)

// Not LifeGame menbers -------------------------

export const selectedColor = writable('#F469E4') // hsl(307,86%,68%)
export const gridView = writable(true)

// Modal
export const enum ModalsHeader {
	Random = 1,
}
export const modal = writable<ModalsHeader | null>(null)
export const initSettingsOpen = writable(false)

export const randomAreaColumns = writable(life.randomAreaColumns)
randomAreaColumns.subscribe((randomAreaColumns: number) => {
	life.randomAreaColumns = randomAreaColumns
})

export const randomAreaRows = writable(life.randomAreaRows)
randomAreaRows.subscribe((randomAreaRows: number) => {
	life.randomAreaRows = randomAreaRows
})

export const edgeColumn = writable(life.edgeColumn)
export const edgeRow = writable(life.edgeRow)

export const randomPoints = (() => {
	const { subscribe, set, update } = writable(life.points.values)
	return {
		subscribe,
		update,
		set: (points: number[]) => {
			set((life.points.values = points))
		},
		addColumns(n?: number) {
			life.points.addColumns(n)
			randomAreaColumns.update((n) => n + 1)

			life.edgeColumn.push(life.edgeCell)
			edgeColumn.update(() => life.edgeColumn)
		},
		removeColumns(n?: number) {
			if (life.randomAreaColumns < 2) {
				return
			}
			life.points.removeColumns(n)
			randomAreaColumns.update((n) => n - 1)

			life.edgeColumn.pop()
			edgeColumn.update(() => life.edgeColumn)
		},
		addRows(n?: number) {
			life.points.addRows(n)
			randomAreaRows.update((n) => n + 1)

			life.edgeRow.push(life.edgeCell)
			edgeRow.update(() => life.edgeRow)
		},
		removeRows(n?: number) {
			if (life.randomAreaRows < 2) {
				return
			}
			life.points.removeRows(n)
			randomAreaRows.update((n) => n - 1)

			life.edgeRow.pop()
			edgeRow.update(() => life.edgeRow)
		},
	}
})()

edgeColumn.subscribe(() => {
	randomPoints.set(life.points.values.slice())
})
edgeRow.subscribe(() => {
	randomPoints.set(life.points.values.slice())
})

export const penMode: Writable<number> = (() => {
	const { subscribe, set, update } = writable(0)
	return {
		subscribe,
		update,
		set: (penMode) => {
			set(penMode % 3)
		},
	}
})()
