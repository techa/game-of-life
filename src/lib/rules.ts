type Numbers = number | ''
export type Rule =
	| `${Numbers}/${Numbers}`
	| `B${Numbers}/S${Numbers}`
	| `${Numbers}/${Numbers}/${Numbers}`
	| `B${Numbers}/S${Numbers}/C${Numbers}`
	| `B${Numbers}/S${Numbers}/G${Numbers}`

// https://conwaylife.com/wiki/List_of_Life-like_cellular_automata
export const rules: Map<string, Rule> = new Map([
	["Conway's Life", 'B3/S23'],
	['HighLife', 'B36/S23'],
	['3-4 Life', 'B34/S34'],
	['B34/S45', 'B34/S45'], // step75:地形データ
	['B34/S458', 'B34/S458'],
	// https://en.wikipedia.org/wiki/Day_and_Night_(cellular_automaton)
	// ['Day & Night', 'B3678/S34678'],
	// ['Iceballs', 'B25678/S5678'], //大きな塊ができる
	// ['Life without death', 'B3/S012345678'], //インクのシミが広がっていくような
	// ['Mazectric', 'B3/S1234'], //迷路
	// ['Maze', 'B3/S12345'], //迷路
	// ['Coral', 'B3/S45678'], //step30:地形データ
	// // 塗りに対して使うと幅２マスの線になる
	// ['Assimilation', 'B345/S4567'], //アメーバみたいに変化しながら菱型になる.塗り
	// ['Long Life', 'B345/S5'], //縦横の線で構成される。大きさがあまり変化しない
	// ['Gems', 'B3457/S4568'], //アメーバみたいに変化しながら菱型になる
	// ['Gems Minor', 'B34578/S456'], //アメーバみたいに変化しながら菱型になる
	['Bugs', 'B3567/S15678'], //うごうご塗り潰し
	// ['Holstein', 'B35678/S4678'], //step40:地形データ!!
	// ['Diamoeba', 'B35678/S5678'], //step30:地形データ!!
	['Slow Blob', 'B367/S125678'], //雪が積もるかのような
	['Stains', 'B3678/S235678'],
	['Stains2', 'B3678/S2345678'],
	['Electrified Maze', 'B45/S12345'], //規則的な外形になろうとする
	// 塗りに対して使うと幅１マスの線になる
	['Walled cities', 'B45678/S2345'], //規則的な外形になろうとする
	['Vote 4/5', 'B4678/S35678'], //step30:地形データ!!
	['Vote1', 'B5678/S45678'], //step40:最強地形データ複雑
	['Vote2', 'B578/S45678'], //step20:最強地形データ複雑隙間多め
	['Vote3', 'B678/S45678'], //step40:最強地形データ隙間多め
	['Vote4', 'B678/S345678'],
	['g', 'B368/S245'],
	['cave', 'B5678/S345678'], //randomCorrection(5)系と相性よし
	['kaku', 'B478/S45678'], //randomCorrection(5)系と相性よし、step30で直線的
	['craggy', 'B4678/S45678'], //randomCorrection(5)系と相性よし、生成が速い。step10
	// Generation
	['Banners', 'B3457/S2367/C5'],
	['Bloomerang', 'B34678/S234/C24'],
	["Brian's Brain", 'B2/S/C3'],
	['Caterpillars', 'B378/S124567/C4 	'],
	['Cooties', 'B2/S23/C8'],
	['Fireworks', 'B13/S2/C21'],
	['Frogs', 'B34/S12/C3'],
	['Lava', 'B45678/S12345/C8'],
	['Lines', 'B458/S012345/C3'],
	['Star Wars', 'B2/S345/C4'],
	['Sticks', 'B2/S3456/C6'],
	['Transers', 'B26/S345/C5'],
	['Xtasy', 'B2356/S1456/C16'],
])

export function ruleParser(rule: Rule): [number[], number[], number] {
	const rules: (number[] | number)[] = rule
		.replace(/[^\d/]*/g, '')
		.split('/')
		.map((v, i) => (i < 2 ? v.split('').map((n) => +n) : Math.max(+v, 2)))

	rules[2] ??= 2
	return rules as [number[], number[], number]
}
