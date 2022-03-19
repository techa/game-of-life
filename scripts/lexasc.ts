import { readFile, writeFile } from 'fs/promises'

readFile('./lex_asc/lexicon.txt', 'utf-8').then((txt) => {
	const arr = []
	txt.replace(/(\t[.*]+\n)+/gm, (cap) => {
		arr.push(
			cap
				.replace(/[^.*\n]/g, '')
				.split('\n')
				.filter((str) => str)
				.map((str) => str.split('').map((v) => (v === '*' ? 1 : 0))),
		)
		return ''
	})

	const arr2 = arr.filter((cells) => cells.length + cells[0].length >= 60)

	writeFile('./src/resource/lexicon.json', JSON.stringify(arr2, null, 4))
})
