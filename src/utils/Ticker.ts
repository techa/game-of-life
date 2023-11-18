export async function sleep(msec: number) {
	let id: number | NodeJS.Timeout
	return new Promise((resolve) => (id = setTimeout(resolve, msec))).then(() =>
		clearTimeout(id),
	)
}

export interface TickerArgs {
	tick?: (count?: number) => void
	interval?: number
}

export class Ticker {
	#id: number | NodeJS.Timeout = 0
	#running = false
	get running() {
		return this.#running
	}

	tick: (count?: number) => void

	/**
	 * Update interval (msec)
	 */
	interval: number
	count = 0

	isBrowser =
		typeof window !== 'undefined' && typeof window.document !== 'undefined'

	constructor(opts?: TickerArgs) {
		this.tick = opts?.tick || (() => {})
		this.interval = opts?.interval || 64
	}

	start(): void {
		if (this.#running) {
			return
		}

		this.#running = true

		if (this.isBrowser) {
			let startTime = Date.now()
			const loop = () => {
				if (!this.#running) {
					this.stop()
					return
				}

				const timestamp = Date.now()
				// console.log(timestamp - startTime)

				if (timestamp - startTime > this.interval) {
					startTime = timestamp
					this.update()
				}
				// リストからコールバック関数を削除するcancelAnimationFrameは、新しいrequestAnimationFrameが生成される前に毎回呼び出す
				cancelAnimationFrame(this.#id as number)
				this.#id = requestAnimationFrame(loop)
			}
			loop()
		} else {
			const loop = async () => {
				if (!this.#running) {
					this.stop()
					return
				}

				await sleep(this.interval)
				this.update()
				loop()
			}
			loop()
		}
	}

	stop(): void {
		this.#running = false
		if (this.isBrowser) {
			cancelAnimationFrame(this.#id as number)
		} else {
			clearTimeout(this.#id)
		}
	}

	update(): void {
		try {
			this.tick(++this.count)
		} catch (error) {
			this.stop()
		}
	}
}
