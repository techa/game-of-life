import { writable, type Writable } from 'svelte/store'
import { base64ToStr, strToBase64 } from './binary.js'

export class SavesStrage<Data> {
	#key: string

	data: Data[]
	index = 0

	constructor(key: string, initialDatas: Data[]) {
		const lsdata = localStorage.getItem(key)
		const parsedData = lsdata
			? JSON.parse(lsdata)
			: { data: initialDatas, index: 0 }
		this.#key = key
		this.data = parsedData.data
		this.index = parsedData.index

		this.save()
	}

	get(index: number) {
		this.index = index
		return this.data[index]
	}

	save() {
		localStorage.setItem(
			this.#key,
			JSON.stringify({
				data: this.data,
				index: this.index,
			}),
		)
	}

	set(index: number, data: Data) {
		this.data[index] = data
		this.save()
	}
}

export type Migrator = (data: any, key: string) => any

export class StrageStores {
	#key: string
	#keys = new Set()

	data: Map<string, unknown> = new Map()
	get(key: string) {
		return this.data.get(key)
	}
	set(key: string, value: any) {
		this.data.set(key, value)
		return this
	}

	constructor(key: string, migrators: Migrator[] = []) {
		this.#key = key

		const lsdata = this.load()

		if (lsdata) {
			let parsedData: Map<string, unknown> = new Map(JSON.parse(lsdata))

			for (const migrator of migrators) {
				if (typeof migrator === 'function') {
					for (const [key, value] of parsedData.entries()) {
						parsedData.set(key, migrator(value, key))
					}
				}
			}

			this.data = parsedData
		}
	}

	create<T = any>(key: string, initialValue: T) {
		return this.addStore(key, writable<T>(initialValue))
	}

	addStore<T extends Writable<any>>(key: string, store: T) {
		if (this.#keys.has(key)) {
			throw new Error(`"${key}" is already exist.`)
		} else {
			this.#keys.add(key)
			
			if (this.data.has(key)) {
				// reload json data
				store.set(this.data.get(key))
			}
		}

		store.subscribe((v) => {
			this.data.set(key, v)
			this.save()
		})
		return store
	}

	load() {
		try {
			const lsdata = localStorage.getItem(this.#key) || '[]'
			return /^\[/.test(lsdata) ? lsdata : base64ToStr(lsdata)
		} catch {
			return '[]'
		}
	}

	save() {
		const json = JSON.stringify([...this.data.entries()])
		const base64 = strToBase64(json)
		localStorage.setItem(
			this.#key,
			json.length > base64.length ? base64 : json,
		)
	}
}
