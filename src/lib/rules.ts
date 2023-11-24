type Numbers = number | ''
export type RuleString =
	| `${Numbers}/${Numbers}`
	| `B${Numbers}/S${Numbers}`
	| `${Numbers}/${Numbers}/${Numbers}`
	| `B${Numbers}/S${Numbers}/${'C' | 'G' | ''}${Numbers}`

// https://conwaylife.com/wiki/List_of_Life-like_cellular_automata
export const rules: Map<RuleString, string> = new Map([
	['B3/S23', "Conway's Life"],
	['B36/S23', 'HighLife'],
	['B34/S34', '3-4 Life'],
	// ['B34/S45', ''], // step75:地形データ
	// ['B34/S458', ''],
	// https://en.wikipedia.org/wiki/Day_and_Night_(cellular_automaton)
	['B3678/S34678', 'Day & Night'],
	['B25678/S5678', 'Iceballs'], //大きな塊ができる
	['B3/S012345678', 'Life without death'], //インクのシミが広がっていくような
	['B3/S1234', 'Mazectric'], //迷路
	['B3/S12345', 'Maze'], //迷路
	['B3/S45678', 'Coral'], //step30:地形データ
	// 塗りに対して使うと幅２マスの線になる
	['B345/S4567', 'Assimilation'], //アメーバみたいに変化しながら菱型になる.塗り
	['B345/S5', 'Long Life'], //縦横の線で構成される。大きさがあまり変化しない
	['B3457/S4568', 'Gems'], //アメーバみたいに変化しながら菱型になる
	['B34578/S456', 'Gems Minor'], //アメーバみたいに変化しながら菱型になる
	['B3567/S15678', 'Bugs'], //うごうご塗り潰し
	['B35678/S4678', 'Holstein'], //step40:地形データ!!
	['B35678/S5678', 'Diamoeba'], //step30:地形データ!!
	['B367/S125678', 'Slow Blob'], //雪が積もるかのような
	['B3678/S235678', 'Stains'],
	['B3678/S2345678', 'Stains2'],
	['B45/S12345', 'Electrified Maze'], //規則的な外形になろうとする
	// 塗りに対して使うと幅１マスの線になる
	['B45678/S2345', 'Walled cities'], //規則的な外形になろうとする
	['B4678/S35678', 'Vote 4/5'], //step30:地形データ!!
	['B5678/S45678', 'Vote'], //step40:地形データ複雑
	['B678/S45678', 'Vote2'], //step40:地形データ隙間多め
	['B578/S45678', 'Vote3'], //step20:地形データ複雑隙間多め
	['B678/S345678', 'Vote4'],
	// ['B368/S245', 'g'],
	['B5678/S345678', 'Island'], //randomCorrection(5)系と相性よし
	['B478/S45678', 'Factory'], //randomCorrection(5)系と相性よし、step30で直線的
	['B4678/S45678', 'craggy'], //randomCorrection(5)系と相性よし、生成が速い。step10
	// Generation
	['B3457/S2367/C5', 'Banners'],
	['B34678/S234/C24', 'Bloomerang'],
	['B2/S/C3', "Brian's Brain"],
	['B378/S124567/C4', 'Caterpillars'],
	['B2/S23/C8', 'Cooties'],
	['B13/S2/C21', 'Fireworks'],
	['B34/S12/C3', 'Frogs'],
	['B45678/S12345/C8', 'Lava'],
	['B458/S012345/C3', 'Lines'],
	['B2/S345/C4', 'Star Wars'],
	['B2/S3456/C6', 'Sticks'],
	['B26/S345/C5', 'Transers'],
	['B2356/S1456/C16', 'Xtasy'],
	// https://conwaylife.com/wiki/List_of_Generations_rules
	['B3/S01245678/C8', 'Meteor Guns'], //step:地形データに使えそう
	['B2478/S45678/C25', 'Nova'], //step:地形データに使えそう。かなり面白い
	['B34/S345/C6', 'Prairie on fire'], //step:地形データに使えそう。
	['B23/S2/C8', 'RainZha'], //step:地形と言うよりは模様
	['B234/S2/C5', 'Spirals'], //step:地形と言うよりは模様
	['B34/S23/C8', 'Swirl'], //step:
	['B34/S1234/C48', 'Thrill Grill'], //step:地形データに使えそう

	['B3468/S0235678/C9', 'Burst'], //step:地形データに使えそう
	['B23678/S145678/C8', 'Burst 2'], //step:地形データに使えそう
	['B3468/S235678/C9', 'Burst2'], //step:地形データに使えそう。２のほうが地形向き

	['B1234/S2345/C8', 'Circuit Genesis'], //step5:地形データに使えそう

	['B36/S012478/C18', 'Ebb and Flow'], //step5:地形データに使えそう
	['B37/S012468/C18', 'Ebb and Flow2'], //step5:地形データに使えそう
	// B34678/S234/C34
])

export function ruleParser(rule: string): [number[], number[], number] {
	const rules: (number[] | number)[] = rule
		.replace(/[^\d/]*/g, '')
		.split('/')
		.map((v, i) =>
			i < 2
				? v
						.split('')
						.map((n) => +n)
						.sort()
				: Math.max(+v, 2),
		)

	rules[2] ??= 2

	if (/^\d*\/\d*(\/\d*)?$/.test(rule)) {
		return [rules[1], rules[0], rules[2]] as [number[], number[], number]
	}
	if (/^B\d*\/S\d*(\/[CG]?\d*)?$/.test(rule)) {
		return rules as [number[], number[], number]
	}

	throw new Error(`"${rule}" is invaild rule string.`)
}

export function ruleToString(
	born: number[],
	survival: number[],
	c: number,
): RuleString {
	let str = `B${born.join('')}/S${survival.join('')}`
	if (c > 2) {
		// https://conwaylife.com/wiki/Generations#cite_note-2
		str += `/C${c}`
	}
	return str as RuleString
}

/**
 * Black/white reversal
 * @see https://conwaylife.com/wiki/Black/white_reversal
 * @param b born
 * @param s survival
 * @param c cycle
 */
export function ruleReversal(
	b: number[],
	s: number[],
	c: number,
): [number[], number[], number] {
	b = [0, 1, 2, 3, 4, 5, 6, 7, 8]
		.filter((v) => !b.includes(v))
		.map((v) => 8 - v)
		.reverse()
	s = [0, 1, 2, 3, 4, 5, 6, 7, 8]
		.filter((v) => !s.includes(v))
		.map((v) => 8 - v)
		.reverse()
	return [s, b, c]
}
