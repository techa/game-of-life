import { derived, writable, type Writable } from 'svelte/store'
import { LifeEvent, LifeGame } from '$lib/LifeGame.js'
import { TableTransform } from '$lib/TableTransform.js'
import { TableInitializer } from '$lib/TableInitializer.js'

interface LifeGameEx extends TableTransform, TableInitializer {}
@TableTransform
@TableInitializer
class LifeGameEx extends LifeGame {}
export const life = new LifeGameEx().init()

export const table = writable(life.cells.get2d())
life.on(LifeEvent.UPDATE, () => {
	table.set(life.cells.get2d())
	// console.log('UPDATE')
})

export const columns = writable(life.columns)
export const rows = writable(life.rows)
life.on(LifeEvent.TABLE_UPDATE, () => {
	columns.set(life.columns)
	rows.set(life.rows)
	life.emit(LifeEvent.UPDATE)
	// console.log('TABLE_UPDATE')
})

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

export const generation = derived(table, () => life.generation)
export const population = derived(table, () => life.population)

// Not LifeGame menbers -------------------------
//'#F469E4' hsl(307,86%,68%)
export const colorHue = writable(life.colorManager.hue)
export const selectedColor = derived(colorHue, (hue) => {
	const color = life.colorManager.setByHue(hue)
	table.update((v) => v)
	return color
})
export const gridColorCentral = derived(selectedColor, () => {
	return life.colorManager.getIncHue(120)
})

export const gridShow = writable(true)
export const gridCursor = writable(true)

export const tooltipShow = writable(false)


// Modal
export const enum ModalsHeader {
	Random = 1,
}
export const modal = writable<ModalsHeader | null>(null)
export const initSettingsOpen = writable(false)

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
	edgeColumn.update(() => life.edgeColumn)
	edgeRow.update(() => life.edgeRow)
})
export const randomAreaColumns = derived(
	randomPoints,
	() => life.randomAreaColumns,
)
export const randomAreaRows = derived(randomPoints, () => life.randomAreaRows)

export const penMode = (() => {
	const { subscribe, set, update } = writable(0)
	const indexes = [0, 1, -1, -2]
	let index = 0
	return {
		subscribe,
		update,
		set,
		next() {
			++index
			set(indexes[(index %= 4)])
			console.log('indexes[++index % 4]', indexes[index])
		},
	}
})()
