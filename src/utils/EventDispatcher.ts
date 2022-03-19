export type EventKey = string | number
export type EventHandler = (event?: unknown) => void
/**
 * ```
 * import {
 * 	EventDispatcher,
 * 	type EventKey,
 * 	type EventHandler,
 * } from './EventDispatcher.js'
 * class {
 * 	#events = new EventDispatcher()
 * 	clear(): void{
 * 		this.#events.clear()
 * 	}
 * 	emit(eventName: EventKey, event?: unknown): void {
 * 		this.#events.emit(eventName, event)
 * 	}
 * 	on(eventName: EventKey, handler: EventHandler): void {
 * 		this.#events.on(eventName, handler)
 * 	}
 * 	off(eventName: EventKey, handler: EventHandler): void {
 * 		this.#events.off(eventName, handler)
 * 	}
 * 	once(eventName: EventKey, handler: EventHandler): void {
 * 		this.#events.once(eventName, handler)
 * 	}
 * 	only(eventName: EventKey, handler: EventHandler): void {
 * 		this.#events.only(eventName, handler)
 * 	}
 * }
 * ```
 */
export class EventDispatcher {
	#handlers: Record<EventKey, EventHandler[]> = {}

	emit(eventName: EventKey, event?: unknown): void {
		if (!event) {
			event = {}
		}
		const handlers = this.#handlers[eventName]

		if (handlers) {
			for (const handler of handlers) {
				handler(event)
			}
		}
	}

	on(eventName: EventKey, handler: EventHandler): void {
		if (!this.#handlers[eventName]) {
			this.#handlers[eventName] = []
		}
		this.#handlers[eventName].push(handler)
	}

	// /**
	//  *
	//  * @param eventName
	//  * @param handler Optional. if null then off all handlers
	//  */
	// off(eventName: EventKey, handler?: EventHandler): void {
	// 	const handlers = this.#handlers[eventName]
	// 	if (handlers) {
	// 		if (!handler) {
	// 			// off all
	// 			this.#handlers[eventName].length = 0
	// 		} else {
	// 			const index = handlers.indexOf(handler)
	// 			this.#handlers[eventName].splice(index, 1)
	// 		}
	// 	}
	// }

	// once(eventName: EventKey, handler: EventHandler): void {
	// 	this.on(eventName, (event: Event) => {
	// 		const ev = event || {}
	// 		this.off(eventName, handler)
	// 		handler(ev)
	// 	})
	// }

	// only(eventName: EventKey, handler: EventHandler): void {
	// 	this.#handlers[eventName] = [handler]
	// }

	// clear() {
	// 	this.#handlers = {}
	// }
}
