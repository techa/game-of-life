/**
 * https://developer.mozilla.org/ja/docs/Glossary/Base64#解決策その_2_-_atob_と_btoa_を_typedarray_と_utf-8_を使用して書き直す
 */

/**
 * 数値の配列をバイナリの配列に圧縮
 *
 * @param {number[]} cells - 圧縮する数値の配列
 * @returns 圧縮されたバイトデータと補正用の最小値・ビットサイズ
 *
 * @example
 * const { bytes, bitSize, minValue } = toBinary([-3, 5, -2, 7, 1, -6, 9]);
 */
export function toBinary(
	cells: Uint8Array | Uint16Array | Uint32Array | number[],
): {
	/**
	 * 圧縮されたバイナリ配列
	 */
	bytes: number[]
	/**
	 * 使用されたビットサイズ(`1 <= minValue <= 8`)
	 */
	bitSize: number
	/**
	 * 元の値を復元するための補正用最小値(`minValue < 0`)
	 */
	minValue: number
} {
	const minValue = Math.min(0, ...cells)
	const maxValue = Math.max(0, ...cells)
	const range = Math.max(1, maxValue - minValue)
	// bitSizeは1以上にしたいので、log2の引数は2以上が必要
	const bitSize = Math.ceil(Math.log2(range + 1))

	const bytes: number[] = []
	let byte = 0
	let bitCount = 0

	for (const cell of cells) {
		let encodedCell = cell

		// 負の値を `bitSize` の上位ビットとして扱う
		if (cell < 0) {
			encodedCell = (1 << bitSize) + cell // `0b111111`
		}

		byte <<= bitSize
		byte |= encodedCell & ((1 << bitSize) - 1)
		bitCount += bitSize

		// 8ビット溜まったら `bytes.push()`
		while (bitCount >= 8) {
			bitCount -= 8
			//                            255を上限にする
			bytes.push((byte >> bitCount) & 0xff)
		}
	}

	// 余ったビットを埋める
	if (bitCount > 0) {
		//                                    255を上限にする
		bytes.push((byte << (8 - bitCount)) & 0xff)
	}

	// 最後に並んでいる `0` を除去
	while (bytes.length > 0 && bytes[bytes.length - 1] === 0) {
		bytes.pop()
	}

	return { bytes, bitSize, minValue }
}

/**
 * バイナリデータを元の数値配列に展開
 *
 * @param {number[]} bytes - 圧縮されたバイナリデータ
 * @param {number} bitSize - バイナリデータのビットサイズ
 * @param {number} minValue - 元の数値を復元するための最小値
 * @returns {number[]} 元の数値配列。完全に同じになるとは限らない。余りが出ることもある。その余りの値は minValue となることに注意。
 *
 * @example
 * const cells = fromBinary([0b0011_0101, 0b0010_0111], 4, -3);
 * console.log(cells); // [-3, 5, -2, 7]
 */
export function fromBinary(
	bytes: number[],
	bitSize: number,
	minValue: number,
): number[] {
	const cells: number[] = []
	let buffer = 0
	let bitCount = 0

	for (const byte of bytes) {
		buffer <<= 8
		buffer |= byte
		bitCount += 8

		while (bitCount >= bitSize) {
			let value = (buffer >> (bitCount - bitSize)) & ((1 << bitSize) - 1)

			// **ビット最大値側の負数を復元**
			if (minValue < 0 && value >= (1 << bitSize) + minValue) {
				value -= 1 << bitSize // 最大値側の負数を補正
			}
			cells.push(value)
			bitCount -= bitSize
		}
	}

	return cells
}

/**
 * cells を base64 にエンコード
 */
export function toBase64(
	cells: Uint8Array | Uint16Array | Uint32Array | number[],
) {
	const { bytes, bitSize, minValue } = toBinary(cells)
	return (
		btoa(String.fromCharCode(...new Uint8Array(bytes))) +
		// && minValue !== -1 は`(-1)[]`のときの判断に必要
		(bitSize === 1 && minValue !== -1 ? '' : `.${bitSize}`) +
		(bitSize === 1 || !minValue ? '' : `${-minValue}`)
	)
}

/**
 * Base64 から `cells` に復元（特殊な負の値を `-1`, `-2` に変換）
 */
export function fromBase64(base64Str: string) {
	const [encoded, bitmin] = base64Str.split('.')
	const bitSize = parseInt((bitmin || '1')[0], 10)

	const bytes = [...atob(encoded)].map((char) => char.charCodeAt(0))

	// bitSizeStr ? -1 : は`(-1)[]`のときの判断に必要
	return fromBinary(
		bytes,
		bitSize,
		bitSize > 1 ? -bitmin.slice(1) : bitmin ? -1 : 0,
	)
}

/**
 * encodeURIComponent の代わりに使う
 */
function toUrlSafe(base64Str: string) {
	// URL safe に変換
	return base64Str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
/**
 * decodeURIComponent の代わりに使う
 */
function fromUrlSafe(base64UrlStr: string) {
	// `Base64` に戻す
	return base64UrlStr.replace(/-/g, '+').replace(/_/g, '/')
}

export function getPermalinkUrl(cells: number[]) {
	const base64Data = toBase64(cells)
	const url = `https://techa.github.io/game-of-life?data=${toUrlSafe(
		base64Data,
	)}`
	return url
}

/**
 * 訪問時のデータ取得
 */
export function getCellsFromQuery() {
	const params = new URLSearchParams(window.location.search)
	const base64Data = params.get('data')

	if (base64Data) {
		const cells = fromBase64(fromUrlSafe(base64Data))

		// クリーンなURLに戻す
		history.replaceState(null, '', window.location.pathname)

		return cells
	}

	return null
}
