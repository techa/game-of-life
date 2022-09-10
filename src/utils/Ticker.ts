export interface TickerArgs {
	tick?: (count?: number) => void
	tpf?: number
	speeds?: number[]
}

export class Ticker {
	#id = 0
	#running = false
	get running() {
		return this.#running
	}

	tick: (count?: number) => void
	// tpf: tick/frame
	tpf = 1
	count = 0

	constructor(opts?: TickerArgs) {
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		this.tick = opts?.tick || (() => {})
		this.tpf = opts?.tpf || 1
	}

	start(): void {
		if (this.#running) {
			return
		}

		this.#running = true

		const loop = () => {
			if (!this.#running) {
				this.stop()
				return
			}

			try {
				this.#id = requestAnimationFrame(loop)
				if (!(this.count++ % this.tpf | 0)) {
					this.update()
				}
			} catch (error) {
				cancelAnimationFrame(this.#id)
				throw error
			}
		}

		loop()
	}

	stop(): void {
		this.#running = false
		cancelAnimationFrame(this.#id)
	}

	update(): void {
		try {
			this.tick(this.count)
		} catch (error) {
			this.stop()
		}
	}
}
