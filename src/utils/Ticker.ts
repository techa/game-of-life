export class Ticker {
	#running = false
	#id: number
	count = 0
	tick: (count: number) => void

	constructor(tick: (count: number) => void) {
		this.tick = tick
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
				this.update()
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
			this.tick(this.count++)
		} catch (error) {
			this.stop()
		}
	}
}
