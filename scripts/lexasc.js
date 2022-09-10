import { readFile, writeFile } from 'fs/promises'

// const val = [0, 6, 10, 21, 23, 25, 34, 36, 53]

readFile('./lex_asc/lexicon.txt', 'utf-8').then((txt) => {
	const lines = txt.split(/\r?\n/g)
	let title = ''
	/**
	 * @type {(0 | 1)[][]}
	 */
	let pattern = []
	/**
	 * @type {Record<string, (0 | 1)[][]>}
	 */
	const data = {}

	for (const line of lines) {
		if (/\t[*.]+$/.test(line)) {
			pattern.push(
				line
					.replace(/[^.*]/g, '')
					.split('')
					.map((v) => (v === '*' ? 1 : 0)),
			)
		} else {
			title = /^:(.+?):/.exec(line)?.[1] || title
		}

		if (pattern.length && /^[^\t.*]*$/.test(line)) {
			// if (pattern.length + pattern[0].length >= 60) {
			// 	data[title] = pattern
			// }
			data[title] = pattern
			pattern = []
		}
	}

	writeFile('./src/resource/lexicon.json', JSON.stringify(data, null, 4))
})
