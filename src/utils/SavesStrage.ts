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
