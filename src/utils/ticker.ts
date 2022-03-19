export type TickerCb = (frame_count: number) => void
export type Canceler = () => void
/**
 * @link https://developer.mozilla.org/ja/docs/Web/API/Window/requestAnimationFrame
 * @param {TickerCb} cb frame_count==0 count by 16ms
 * @returns {() => void} cancelAnimationFrame
 */
export function ticker(cb: TickerCb): Canceler {
	let id: number
	let frame_count = 0
	const loop: FrameRequestCallback = () => {
		// if (!start) start = timestamp
		// const progress = timestamp - start

		cb(frame_count)
		frame_count++
		// 次のフレーム時の処理の実行を予約
		id = requestAnimationFrame(loop)
	}
	// 初回呼び出し
	loop(0)
	// console.log('loopAnime', id, frame_count)

	// canceler
	return (() => {
		cancelAnimationFrame(id)
		// console.log('canceler', id, frame_count)
	}) as Canceler
}
