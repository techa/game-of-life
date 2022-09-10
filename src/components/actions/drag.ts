import type { Writable } from 'svelte/store'

export function drag(node: Element, dragging: Writable<Element | null>) {
	let x = 0
	let y = 0
	let startX = 0
	let startY = 0
	let rect = node.getBoundingClientRect()
	dragging.set(null)

	function clamp(x, max = Infinity, min = 0) {
		if (max < min) [min, max] = [max, min]
		return Math.min(Math.max(min, x), max)
	}

	function mousemove(event) {
		x = event.clientX - rect.left
		y = event.clientY - rect.top

		node.dispatchEvent(
			new CustomEvent('drag', {
				detail: { x, y, startX, startY, rect, clamp, event: 'drag' },
			}),
		)
	}

	function mouseup(event) {
		x = event.clientX - rect.left
		y = event.clientY - rect.top

		dragging.set(null)
		node.dispatchEvent(
			new CustomEvent('drag', {
				detail: { x, y, startX, startY, rect, clamp, event: 'dragend' },
			}),
		)

		window.removeEventListener('mousemove', mousemove, false)
		window.removeEventListener('mouseup', mouseup, false)
	}

	function mousedown(event) {
		if (event.which !== 1) return

		event.preventDefault()

		rect = node.getBoundingClientRect()
		x = startX = event.clientX - rect.left
		y = startY = event.clientY - rect.top

		dragging.set(node)
		node.dispatchEvent(
			new CustomEvent('drag', {
				detail: {
					x,
					y,
					startX,
					startY,
					rect,
					clamp,
					event: 'dragstart',
				},
			}),
		)

		window.addEventListener('mousemove', mousemove, false)
		window.addEventListener('mouseup', mouseup, false)
	}

	node.addEventListener('mousedown', mousedown, false)

	return {
		destroy() {
			node.removeEventListener('mousedown', mousedown, false)
		},
	}
}
