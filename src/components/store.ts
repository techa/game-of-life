import { derived, writable, type Writable } from 'svelte/store'
import { LifeEvent, LifeGame } from '$lib/LifeGame.js'
import { TableTransform } from '$lib/TableTransform.js'
import { TableInitializer } from '$lib/TableInitializer.js'
import { rules, type RuleString } from '$lib/rules.js'

import { StrageStores } from '../utils/SavesStrage.js'

const enum SaveKeys {
	ruleString = 'rS',
	colorHue = 'cH',
	gridShow = 'gS',
	gridCentral = 'gC',
	gridCursor = 'gCur',
	tooltipShow = 'ttS',
	templateLoaded = 'tL',
	tableViewMode = 'tVM',
	autoConway = 'aC',
	penMode = 'pM',
}

const stores = new StrageStores('GameOfLife')
stores.set('version', 'v0.4.1')

interface LifeGameEx extends TableTransform, TableInitializer {}
@TableTransform
@TableInitializer
class LifeGameEx extends LifeGame {}
export const life = new LifeGameEx().init()

export const isRunning = writable(life.isRunning)
life.on(LifeEvent.START, () => {
	isRunning.set(true)
})
life.on(LifeEvent.STOP, () => {
	isRunning.set(false)
})

export const ruleString = stores.create<RuleString>(
	SaveKeys.ruleString,
	'B3/S23',
)
export const ruleName = derived(ruleString, ($ruleString) => {
	// ruleString.subscribe
	life.setRule($ruleString)

	return rules.get($ruleString)
})

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

export const canStep = derived([table, ruleString], () => life.canStep)

// Not LifeGame menbers -------------------------
//'#F469E4' hsl(307,86%,68%)
export const colorHue = stores.create(SaveKeys.colorHue, life.colorManager.hue)
export const selectedColor = derived(colorHue, (hue) => {
	const color = life.colorManager.setByHue(hue)
	table.update((v) => v)
	return color
})
export const gridColorCentral = derived(selectedColor, () => {
	return life.colorManager.getIncHue(120)
})

export const gridShow = stores.create(SaveKeys.gridShow, true)
export const gridCentral = stores.create(SaveKeys.gridCentral, true)

export const gridCursor = stores.create(SaveKeys.gridCursor, true)

export const tooltipShow = stores.create(SaveKeys.tooltipShow, true)

export const templateLoaded = stores.create(SaveKeys.templateLoaded, false)

export const tableViewMode = stores.create<'fit' | 'full'>(
	SaveKeys.tableViewMode,
	'fit',
)

// Automatically change the rule to `Conway's life` when a template is selected
export const autoConway = stores.create(SaveKeys.autoConway, true)

// Modal ===================

export const modal = writable(false)

// Modal Random --------------

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

export const penMode = stores.addStore(
	SaveKeys.penMode,
	(() => {
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
	})(),
)
