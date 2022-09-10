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
