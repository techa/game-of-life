import { writable, type Writable } from 'svelte/store'
import { LifeGame } from '$lib/LifeGame.js'
import { TableTransform } from '$lib/TableTransform.js'
import { TableInitializer } from '$lib/TableInitializer.js'

interface LifeGameEx extends TableTransform, TableInitializer {}
@TableTransform
@TableInitializer
class LifeGameEx extends LifeGame {}
export const life = new LifeGameEx().init()

export const table = writable(life.cells.get2d())

export const columns = writable(life.columns)
export const rows = writable(life.rows)

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
//'#F469E4' hsl(307,86%,68%)
export const selectedColor = writable(life.getColor())
export const gridView = writable(false)

// Modal
export const enum ModalsHeader {
	Random = 1,
}
export const modal = writable<ModalsHeader | null>(null)
export const initSettingsOpen = writable(false)

export const randomAreaColumns = writable(life.randomAreaColumns)

export const randomAreaRows = writable(life.randomAreaRows)

export const edgeColumn = writable(life.edgeColumn)
export const edgeRow = writable(life.edgeRow)

export const randomPoints = (() => {
	const { subscribe, set, update } = writable(life.points.values)
	return {
		subscribe,
		update,
		set: (points: number[]) => {
			set(points)
		},
		addColumns(n?: number) {
			life.points.addColumns(n)
			life.edgeColumn.push(life.edgeCell)
			set(life.points.values)
		},
		removeColumns(n?: number) {
			if (life.randomAreaColumns < 2) {
				return
			}
			life.points.removeColumns(n)
			life.edgeColumn.pop()
			set(life.points.values)
		},
		addRows(n?: number) {
			life.points.addRows(n)
			life.edgeRow.push(life.edgeCell)
			set(life.points.values)
		},
		removeRows(n?: number) {
			if (life.randomAreaRows < 2) {
				return
			}
			life.points.removeRows(n)
			life.edgeRow.pop()
			set(life.points.values)
		},
	}
})()

randomPoints.subscribe(() => {
	randomAreaColumns.set(life.randomAreaColumns)
	randomAreaRows.set(life.randomAreaRows)

	edgeColumn.update(() => life.edgeColumn)
	edgeRow.update(() => life.edgeRow)
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
