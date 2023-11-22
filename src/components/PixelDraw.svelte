<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte'
	import { readable, type Writable } from 'svelte/store'

	const dispatch = createEventDispatcher<{
		setValue: { x: number; y: number; ctx: CanvasRenderingContext2D }
		drawDot: { x: number; y: number; ctx: CanvasRenderingContext2D }
		// /**
		//  * For setting ctx.strokeStyle & ctx.lineWidth
		//  * ```
		//  * on:setGridStyle={(e) => {
		// 	const { ctx, x, y } = e.detail
		// 	const enphasis = 3
		// 	ctx.strokeStyle
		// 	ctx.lineWidth = enphasis ? 2 : 1
		// }}
		// ```
		//  * @param x focus cell coordinates x
		//  * @param y focus cell coordinates y
		//  * @param ctx ctx.strokeStyle, ctx.lineWidth
		//  * @param gIndex grid index
		//  * @param axis x/y
		//  */
		// setGridStyle: {
		// 	x: number
		// 	y: number
		// 	ctx: CanvasRenderingContext2D
		// 	gIndex: number
		// 	axis: string
		// }
	}>()

	export let cells: Writable<unknown[][]>

	export let gridShow = readable(true)
	export let gridCursor = readable(true)
	export let gridCursorColor = readable('#ccc')
	export let gridColor = readable('#333')
	export let gridColorEmphasis = readable('#555')
	export let gridColorCentral = readable('#188')

	export let viewMode = 'full'

	let cell_size = 10

	/**
	 * pixels size width
	 */
	let columns = 32
	/**
	 * pixels size height
	 */
	let rows = 24
	let px_canvas: HTMLCanvasElement
	let sc_canvas: HTMLCanvasElement

	/**
	 * screen size width
	 */
	let width = 120
	/**
	 * screen size height
	 */
	let height = 120
	let px_ctx: CanvasRenderingContext2D
	let sc_ctx: CanvasRenderingContext2D

	let pixel_draw: HTMLDivElement
	let canvas_wapper: HTMLDivElement
	let boxRect: DOMRect

	onMount(() => {
		const _px_ctx = px_canvas.getContext('2d')
		const _sc_ctx = sc_canvas.getContext('2d')
		if (_px_ctx && _sc_ctx) {
			px_ctx = _px_ctx
			sc_ctx = _sc_ctx
		} else {
			console.error(`canvas.getContext('2d') returns null`)
		}
		boxRect = pixel_draw.getBoundingClientRect()
	})

	$: if (canvas_wapper) {
		const vertical = boxRect.width < boxRect.height
		if (viewMode === 'full') {
			if (vertical) {
				cell_size = columns / boxRect.width
				width = boxRect.width
				height = rows / cell_size
			} else {
				cell_size = rows / boxRect.height
				width = columns / cell_size
				height = boxRect.height
			}
		}
	}

	let isPress = false
	let isHover = false

	let enphasises: number[][] = [[], []]

	$: {
		columns = $cells[0].length
		rows = $cells.length
		pxDraw()

		enphasises = [enphasisIndexes(columns), enphasisIndexes(rows)]
	}

	function enphasisIndexes(colrow: number) {
		const enphasises = []

		if (!(colrow % 2)) {
			enphasises.push(-(colrow / 2))
		}

		if (!(colrow % 3)) {
			enphasises.push(-(colrow / 3))
			enphasises.push(-colrow + colrow / 3)
		}

		if (!(colrow % 6)) {
			enphasises.push(-(colrow / 6))
			enphasises.push(-colrow + colrow / 6)
		}
		if (!(colrow % 5)) {
			for (let i = 1; i < colrow / 5; i++) {
				enphasises.push(i * 5)
			}
		} else if (!(colrow % 4)) {
			for (let i = 1; i < colrow / 4; i++) {
				enphasises.push(i * 4)
			}
		}
		return enphasises
	}

	function getXY(e: MouseEvent): [number, number] {
		const {
			x: boxx,
			y: boxy,
			width,
			height,
		} = canvas_wapper.getBoundingClientRect()

		const x = (((e.clientX - boxx) * columns) / width) | 0
		const y = (((e.clientY - boxy) * rows) / height) | 0
		return [x, y]
	}

	function setValue([x, y]: [number, number]) {
		dispatch('setValue', { ctx: px_ctx, x, y })
	}

	function drawDot([x, y]: [number, number]) {
		dispatch('drawDot', { ctx: px_ctx, x, y })
	}

	function pxDraw() {
		if (px_ctx) {
			px_ctx.clearRect(-1, -1, columns + 1, rows + 1)
		}
		for (let y = 0; y < rows; y++) {
			for (let x = 0; x < columns; x++) {
				drawDot([x, y])
			}
		}
	}

	function drawGridLine(axis: number, i: number) {
		sc_ctx.beginPath()
		if (!axis) {
			const cell_size = width / columns
			const w = Math.round(i * cell_size)
			sc_ctx.moveTo(w, 0)
			sc_ctx.lineTo(w, height)
		} else {
			const cell_size = height / rows
			const h = Math.round(i * cell_size)
			sc_ctx.moveTo(0, h)
			sc_ctx.lineTo(width, h)
		}
		sc_ctx.closePath()
		sc_ctx.stroke()
	}

	gridShow.subscribe(() => scDraw())
	gridCursor.subscribe(() => scDraw())
	function scDraw(coordinate: [number, number] = [-2, -2]) {
		if (!sc_ctx) {
			return
		}
		sc_ctx.clearRect(-1, -1, width + 2, height + 2)

		if ($gridShow) {
			const sizes = [columns, rows]

			for (const axis of [0, 1]) {
				const colrow = sizes[axis]
				const enphas = enphasises[axis]

				for (let i = 0; i <= colrow; i++) {
					const inportant = enphas.includes(-i)
					const enphasis = enphas.includes(i)

					sc_ctx.strokeStyle = inportant
						? $gridColorCentral
						: enphasis
						? $gridColorEmphasis
						: $gridColor
					sc_ctx.lineWidth = enphasis ? 2 : 1

					drawGridLine(axis, i)
				}
			}
		}

		for (const axis of [0, 1]) {
			sc_ctx.strokeStyle = $gridCursorColor
			drawGridLine(axis, coordinate[axis])
			drawGridLine(axis, coordinate[axis] + 1)
		}
	}
</script>

<svelte:window
	on:mousemove={(e) => {
		if (isHover || isPress) {
			const xy = getXY(e)
			scDraw(xy)
		}
	}}
	on:mouseup={(e) => {
		if (e.button !== 2 && isPress) {
			// history memory
		}
		isPress = false
		scDraw()
	}}
	on:keydown={(e) => {
		// https://developer.mozilla.org/ja/docs/Web/API/KeyboardEvent/code
		if (e.ctrlKey) {
			switch (e.code) {
				case 'KeyZ':
					if (e.shiftKey) {
						// redo
					} else {
						// undo
					}
					break

				default:
					break
			}
		}
	}}
/>

<div
	class="pixel_draw w-full h-full overflow-hidden flex justify-center items-center {$$props.class}"
	style={$$props.style}
	bind:this={pixel_draw}
>
	<div
		class="canvas_wapper relative"
		style:width={width + 'px'}
		style:height={height + 'px'}
		bind:this={canvas_wapper}
	>
		<canvas
			class="px_canvas"
			bind:this={px_canvas}
			width={columns}
			height={rows}
		/>
		<canvas
			class="sc_canvas"
			bind:this={sc_canvas}
			{width}
			{height}
			on:mouseleave={() => {
				isHover = false
				scDraw()
			}}
			on:mouseenter={() => {
				isHover = true
			}}
			on:mousedown|preventDefault={(e) => {
				const xy = getXY(e)
				if (e.button === 2 /* Right click */) {
					// right click spuit?
				} else {
					isPress = true
					setValue(xy)
					drawDot(xy)
					$cells
				}
			}}
			on:mousemove|preventDefault={(e) => {
				const xy = getXY(e)
				if (isPress) {
					setValue(xy)
					drawDot(xy)
				}
				$cells
			}}
			on:contextmenu|preventDefault
		/>
	</div>
</div>

<style>
	canvas {
		position: absolute;
		top: 0;
		left: 0;
		margin: 0;
		padding: 0;
		width: 100%;
		height: 100%;
		image-rendering: pixelated;
	}
	.mirror.horizontal {
		position: absolute;
		top: 0;
		left: 50%;
		width: 1px;
		height: 100%;
		background-color: var(--red);
	}
	.mirror.vertical {
		position: absolute;
		left: 0;
		top: 50%;
		height: 1px;
		width: 100%;
		background-color: var(--red);
	}
</style>
