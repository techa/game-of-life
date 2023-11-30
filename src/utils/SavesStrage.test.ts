// https://vitest.dev/api/expect.html
// https://jestjs.io/docs/expect
import { describe, it, expect } from 'vitest'
import { get, writable } from 'svelte/store'
import { SavesStrage, StrageStores } from './SavesStrage.js'
import { strToBase64, base64ToStr } from './binary.js'

class TestStrageStores extends StrageStores {
	save() {
		console.log('save', this.data)
		const json = JSON.stringify([...this.data.entries()])
		console.log('json', json)
		console.log('base64', strToBase64(json))
	}
}

class TestStrageStores2 extends TestStrageStores {
	load() {
		const base64 = 'W1sic3dpdGNoU3RvcmUiLGZhbHNlXSxbImZvbyIsInRlc3QiXV0='
		const data = base64ToStr(base64)
		return data
	}
}

describe(`StrageStores`, () => {
	it(`StrageStores save`, () => {
		const stores = new TestStrageStores('kkk')
		const switchStore = stores.create('switchStore', true)
		switchStore.set(false)
		expect(get(switchStore)).toBe(false)

		const foo = (() => {
			const { set, subscribe, update } = writable('test')
			return { set, subscribe, update }
		})()

		stores.addStore('foo', foo)

		expect(get(foo)).toBe('test')
	})

	it(`StrageStores load`, () => {
		const stores = new TestStrageStores2('test')
		expect([...stores.data.entries()]).toStrictEqual([
			['switchStore', false],
			['foo', 'test'],
		])
	})

	it(`StrageStores migration`, () => {
		const stores = new TestStrageStores2('test2', [
			(value, i) => (i === 'foo' ? { value } : value),
		])
		expect([...stores.data.entries()]).toStrictEqual([
			['switchStore', false],
			['foo', { value: 'test' }],
		])
	})
})
