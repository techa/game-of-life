type Numbers = number | ''
export type RuleString =
	| `${Numbers}/${Numbers}`
	| `B${Numbers}/S${Numbers}`
	| `${Numbers}/${Numbers}/${Numbers}`
	| `B${Numbers}/S${Numbers}/${'C' | 'G' | ''}${Numbers}`

export type RuleArguments = [number[], number[], number]

interface RulesData {
	index?: number
	name: string
	rule: RuleString
}

export class Rules<T extends RulesData> extends Array<T> {
	name!: string
	born!: number[]
	survival!: number[]
	cycle!: number

	constructor(...args: T[]) {
		super(...args.map((data, index) => ({ index, ...data })))
		if (args[0]?.name) {
			this.select(args[0].name)
		}
	}

	select(name: string) {
		const data = this.search(name, 'name')
		if (data) {
			this.name = data.name
			;[this.born, this.survival, this.cycle] = this._parse(data.rule)
		} else {
			throw new Error(`Rules.select(${name}) is undefined`)
		}
		return this
	}

	search(source: number | string, key?: string) {
		for (const data of this) {
			if (key) {
				if (data[key as keyof typeof data] === source) {
					return data
				}
			} else {
				for (const dataKey in data) {
					if (data[dataKey as keyof typeof data] === source) {
						return data
					}
				}
			}
		}
		return undefined
	}

	static RULE_KEYS = ['born', 'survival', 'cycle'] as const

	sortBy(
		key: keyof RulesData | (typeof Rules.RULE_KEYS)[number],
		ascending = true,
	): this {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const index = Rules.RULE_KEYS.indexOf(key as any)
		if (index > -1) {
			key = 'rule'
		}

		this.sort((a, b) => {
			let valueA = a[key as keyof RulesData]
			let valueB = b[key as keyof RulesData]

			if (index > -1) {
				valueA = a.rule.split('/')[index] || ''
				valueB = b.rule.split('/')[index] || ''
			}

			// 数値のソート
			if (typeof valueA === 'number' && typeof valueB === 'number') {
				return ascending ? valueA - valueB : valueB - valueA
			}

			// 文字列のソート
			if (typeof valueA === 'string' && typeof valueB === 'string') {
				return ascending
					? valueA.localeCompare(valueB)
					: valueB.localeCompare(valueA)
			}

			// ソート不可
			return 0
		})

		return this
	}

	parse(ruleStr: string) {
		this.name = this.search(ruleStr, 'rule')?.name || ''
		const rules = this._parse(ruleStr)
		;[this.born, this.survival, this.cycle] = rules
		return rules
	}

	private _parse(ruleStr: string): RuleArguments {
		const rules = ruleStr
			.replace(/[^\d/]*/g, '')
			.split('/')
			.map((v, i) =>
				i < 2 ? [...v].map((n) => +n).sort() : Math.max(+v, 2),
			) as RuleArguments

		this.cycle = rules[2] ??= 2

		if (/^\d*\/\d*(\/\d*)?$/.test(ruleStr)) {
			return [rules[1], rules[0], this.cycle]
		} else if (/^B\d*\/S\d*(\/[CG]?\d*)?$/.test(ruleStr)) {
			return [rules[0], rules[1], this.cycle]
		}

		throw new Error(`"${ruleStr}" is invalid rule string.`)
	}

	toString() {
		let str = `B${this.born.join('')}/S${this.survival.join('')}`
		if (this.cycle > 2) {
			// https://conwaylife.com/wiki/Generations#cite_note-2
			str += `/C${this.cycle}`
		}
		return str as RuleString
	}

	/**
	 * Black/white reversal
	 * @see https://conwaylife.com/wiki/Black/white_reversal
	 */
	reversal() {
		const survival = this._reversal(this.born)
		const born = this._reversal(this.survival)
		return [(this.born = born), (this.survival = survival), this.cycle]
	}

	private _reversal(values: number[]) {
		return [0, 1, 2, 3, 4, 5, 6, 7, 8]
			.filter((v) => !values.includes(v))
			.map((v) => 8 - v)
			.reverse()
	}
}

// https://conwaylife.com/wiki/List_of_Life-like_cellular_automata
export const rules = new Rules(
	{ name: "Conway's Life", rule: 'B3/S23' },
	{ name: 'HighLife', rule: 'B36/S23' },
	{ name: '3-4 Life', rule: 'B34/S34' },
	// {name: '', rule: 'B34/S45'}, // step75:地形データ
	// {name: '', rule: 'B34/S458'},
	// https://en.wikipedia.org/wiki/Day_and_Night_(cellular_automaton)
	{ name: 'Day & Night', rule: 'B3678/S34678' },
	{ name: 'Iceballs', rule: 'B25678/S5678' }, //大きな塊ができる
	{ name: 'Life without death', rule: 'B3/S012345678' }, //インクのシミが広がっていくような
	{ name: 'Mazectric', rule: 'B3/S1234' }, //迷路
	{ name: 'Maze', rule: 'B3/S12345' }, //迷路
	{ name: 'Coral', rule: 'B3/S45678' }, //step30:地形データ
	// 塗りに対して使うと幅２マスの線になる
	{ name: 'Assimilation', rule: 'B345/S4567' }, //アメーバみたいに変化しながら菱型になる.塗り
	{ name: 'Long Life', rule: 'B345/S5' }, //縦横の線で構成される。大きさがあまり変化しない
	{ name: 'Gems', rule: 'B3457/S4568' }, //アメーバみたいに変化しながら菱型になる
	{ name: 'Gems Minor', rule: 'B34578/S456' }, //アメーバみたいに変化しながら菱型になる
	{ name: 'Bugs', rule: 'B3567/S15678' }, //うごうご塗り潰し
	{ name: 'Holstein', rule: 'B35678/S4678' }, //step40:地形データ!!
	{ name: 'Diamoeba', rule: 'B35678/S5678' }, //step30:地形データ!!
	{ name: 'Slow Blob', rule: 'B367/S125678' }, //雪が積もるかのような
	{ name: 'Stains', rule: 'B3678/S235678' },
	{ name: 'Stains2', rule: 'B3678/S2345678' },
	{ name: 'Electrified Maze', rule: 'B45/S12345' }, //規則的な外形になろうとする
	// 塗りに対して使うと幅１マスの線になる
	{ name: 'Walled cities', rule: 'B45678/S2345' }, //規則的な外形になろうとする

	// 地形データ
	{ name: 'Vote 4/5', rule: 'B4678/S35678' }, //step30:地形データ!!
	{ name: 'Vote', rule: 'B5678/S45678' }, //step40:地形データ複雑
	// ドットとなる S0 がポイント。S145678 や S245678 も悪くない
	{ name: 'Vote dot', rule: 'B5678/S045678' }, //step40:地形データ複雑
	{ name: 'Vote2', rule: 'B678/S45678' }, //step40:地形データ隙間多め
	{ name: 'Vote3', rule: 'B578/S45678' }, //step20:地形データ複雑隙間多め
	{ name: 'Vote4', rule: 'B678/S345678' },
	// random:40% くらいがよい
	{ name: 'Island', rule: 'B5678/S345678' },
	{ name: 'Factory', rule: 'B478/S45678' }, //step30で直線的
	// random:40% くらいがよい
	{ name: 'craggy', rule: 'B4678/S45678' }, //生成が速い。step10

	// Generation Rules ==========

	{ name: 'Banners', rule: 'B3457/S2367/C5' },
	// 永久
	{ name: 'Bloomerang', rule: 'B34678/S234/C24' },
	{ name: "Brian's Brain", rule: 'B2/S/C3' },
	{ name: 'Caterpillars', rule: 'B378/S124567/C4' },
	{ name: 'Cooties', rule: 'B2/S23/C8' },
	{ name: 'Fireworks', rule: 'B13/S2/C21' },
	{ name: 'Frogs', rule: 'B34/S12/C3' },
	{ name: 'Lava', rule: 'B45678/S12345/C8' },
	{ name: 'Lines', rule: 'B458/S012345/C3' },
	{ name: 'Star Wars', rule: 'B2/S345/C4' },
	{ name: 'Sticks', rule: 'B2/S3456/C6' },
	{ name: 'Transers', rule: 'B26/S345/C5' },
	{ name: 'Xtasy', rule: 'B2356/S1456/C16' },
	// https://conwaylife.com/wiki/List_of_Generations_rules
	{ name: 'Meteor Guns', rule: 'B3/S01245678/C8' }, //step:地形データに使えそう

	// かなり面白い。お気に入り。
	{ name: 'Nova', rule: 'B2478/S45678/C25' },
	// Novaと違い永久ループに入れる
	{ name: 'Nova ex', rule: 'B2678/S45678/C25' },
	// これもNova派生だがまたちょっと違う永久ループB1のところをB0にしても良い
	// 島と海って感じ
	{ name: 'Nova Island & Sea', rule: 'B1678/S45678/C25' },

	{ name: 'Prairie on fire', rule: 'B34/S345/C6' }, //step:地形データに使えそう。
	{ name: 'RainZha', rule: 'B23/S2/C8' }, //step:地形と言うよりは模様
	{ name: 'Spirals', rule: 'B234/S2/C5' }, //step:地形と言うよりは模様
	{ name: 'Swirl', rule: 'B34/S23/C8' }, //step:
	// 爆発的に広がっていってMaze系の模様を残しながら安定的にカラフルに明滅し続ける。
	{ name: 'Thrill Grill', rule: 'B34/S1234/C48' }, //step:地形データに使えそう

	{ name: 'Burst', rule: 'B3468/S0235678/C9' }, //step:地形データに使えそう
	{ name: 'Burst 2', rule: 'B23678/S145678/C8' }, //step:地形データに使えそう
	{ name: 'Burst2', rule: 'B3468/S235678/C9' }, //step:地形データに使えそう。２のほうが地形向き

	{ name: 'Circuit Genesis', rule: 'B1234/S2345/C8' }, //step5:地形データに使えそう

	{ name: 'Ebb and Flow', rule: 'B36/S012478/C18' }, //step5:地形データに使えそう
	{ name: 'Ebb and Flow2', rule: 'B37/S012468/C18' }, //step5:地形データに使えそう
	// B34678/S234/C34
)
