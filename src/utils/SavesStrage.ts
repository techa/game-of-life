import { get, writable, type Writable } from 'svelte/store'
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

export type SaveData = Record<string, any>
export type Migrator = (data: SaveData) => SaveData

export class StrageStores {
	#key: string
	#keys = new Set()

	data = {} as Record<string, Writable<unknown>>

	getStore(key: string) {
		return this.data[key]
	}
	get(key: string) {
		return get(this.getStore(key))
	}
	setStore<T>(key: string, store: Writable<T>) {
		;(store as any).toJSON = () => get(store)
		this.data[key] = store
	}
	set<T = any>(key: string, value: T) {
		const store = writable<T>(value)
		this.setStore(key, store)
		return this
	}

	constructor(key: string, migrators: Migrator[] = []) {
		this.#key = key

		const lsdata = this.load()

		let data: SaveData = JSON.parse(lsdata)
		for (const migrator of migrators) {
			if (typeof migrator === 'function') {
				data = migrator(data)
			}
		}

		for (const [key, value] of Object.entries(data)) {
			this.data[key] = writable(value)
		}
	}

	create<T>(key: string, initialValue: T) {
		return this.addStore(key, writable<T>(initialValue))
	}

	addStore<T, U extends Writable<T>>(key: string, store: U) {
		if (this.#keys.has(key)) {
			throw new Error(`"${key}" is already exist.`)
		}

		this.#keys.add(key)

		const _store = this.data[key] as U

		if (_store) {
			// if localStrage has data then load data
			store.set(get(_store))
		}

		this.setStore(key, store)

		store.subscribe(async () => {
			this.save()
		})
		return store
	}

	load() {
		try {
			const lsdata = localStorage.getItem(this.#key) || '{}'
			return /^\{/.test(lsdata) ? lsdata : base64ToStr(lsdata)
		} catch {
			return '{}'
		}
	}

	save() {
		const json = JSON.stringify(this.data)
		const base64 = strToBase64(json)
		localStorage.setItem(
			this.#key,
			json.length > base64.length ? base64 : json,
		)
	}
}
