<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte'
	import { readable, type Writable } from 'svelte/store'

	type DrawEvent = MouseEvent & {
		currentTarget: EventTarget & HTMLCanvasElement
	}

	const dispatch = createEventDispatcher<{
		mousemove: {
			x: number
			y: number
			mouseEvent: DrawEvent
			isPress: boolean
		}
		mouseenter: {
			mouseEvent: DrawEvent
			isPress: boolean
		}
		mouseleave: {
			mouseEvent: DrawEvent
			isPress: boolean
		}
		setValue: {
			x: number
			y: number
			ctx: CanvasRenderingContext2D
			mouseEvent: DrawEvent
		}
		drawDot: {
			x: number
			y: number
			ctx: CanvasRenderingContext2D
			pen: boolean
		}
		optionDraw: { x: number; y: number; ctx: CanvasRenderingContext2D }
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

	export let viewMode = 'square'

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
	let boxRect: DOMRect

	let canvas_wapper: HTMLDivElement
	let canvasRect: DOMRect
	let canvasResize: DOMRect

	onMount(() => {
		const _px_ctx = px_canvas.getContext('2d')
		const _sc_ctx = sc_canvas.getContext('2d')
		if (_px_ctx && _sc_ctx) {
			px_ctx = _px_ctx
			sc_ctx = _sc_ctx
		} else {
			console.error(`canvas.getContext('2d') returns null`)
		}
		getRects()
	})

	function getRects() {
		// console.log('getRects')
		boxRect = pixel_draw.getBoundingClientRect()
		canvasRect = canvas_wapper.getBoundingClientRect()
	}

	$: if (canvasResize) {
		// console.log('resize')
		getRects()
		scDraw()
	}

	/**
	 * 1cell width
	 */
	let w = 0
	/**
	 * 1cell height
	 */
	let h = 0
	$: if (canvas_wapper) {
		// const vertical = boxRect.width < boxRect.height
		switch (viewMode) {
			case 'full':
				width = boxRect.width
				height = boxRect.height
				break
			case 'square':
			default:
				{
					w = boxRect.width / columns
					h = boxRect.height / rows
					const boxRatio = boxRect.width / boxRect.height
					const canvasRatio = w / h
					if (boxRatio > canvasRatio) {
						width = boxRect.width
						height = rows * w
					} else {
						width = columns * h
						height = boxRect.height
					}
				}
				break
		}

		pxDraw()
	}

	let isPress = false
	let isHover = false

	let enphasises: number[][] = [[], []]

	cells.subscribe(() => {
		columns = $cells[0].length
		rows = $cells.length
		pxDraw()
		enphasises = [enphasisIndexes(columns), enphasisIndexes(rows)]
	})

	/**
	 * create Grid enphasis & Central line indexs
	 * * enphasis is positive value
	 * * central is negative value
	 * @param colrow columns or rows
	 */
	function enphasisIndexes(colrow: number) {
		const enphasises = []

		// center line
		if (!(colrow % 2)) {
			enphasises.push(-(colrow / 2))
		} else {
			// 2 lines when odd size
			enphasises.push(-Math.floor(colrow / 2))
			enphasises.push(-Math.ceil(colrow / 2))
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
		const { x: boxPositionX, y: boxPositionY, width, height } = canvasRect

		const x = (((e.clientX - boxPositionX) * columns) / width) | 0
		const y = (((e.clientY - boxPositionY) * rows) / height) | 0
		return [x, y]
	}

	function setValue(e: DrawEvent) {
		const [x, y] = getXY(e)
		if (isPress) {
			dispatch('setValue', { ctx: px_ctx, x, y, mouseEvent: e })
			drawDot([x, y], true)
		}
	}

	function drawDot([x, y]: [number, number], pen = false) {
		dispatch('drawDot', { ctx: px_ctx, x, y, pen })
	}
	function optionDraw([x, y]: [number, number]) {
		dispatch('optionDraw', { ctx: sc_ctx, x, y })
	}

	function pxDraw() {
		if (px_ctx && sc_ctx) {
			px_ctx.clearRect(-1, -1, columns + 1, rows + 1)
			for (let y = 0; y < rows; y++) {
				for (let x = 0; x < columns; x++) {
					drawDot([x, y])
					optionDraw([x, y])
				}
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
		const bit = [0, 1]

		if ($gridShow) {
			const sizes = [columns, rows]

			// draw base grid line
			for (const axis of bit) {
				const colrow = sizes[axis]
				for (let i = 0; i <= colrow; i++) {
					sc_ctx.strokeStyle = $gridColor
					sc_ctx.lineWidth = 1
					drawGridLine(axis, i)
				}
			}
			// draw enphas line
			for (const axis of bit) {
				for (const enphas of enphasises[axis])
					if (enphas > 0) {
						sc_ctx.strokeStyle = $gridColorEmphasis
						sc_ctx.lineWidth = 2
						drawGridLine(axis, enphas)
					}
			}
			// draw central line
			for (const axis of bit) {
				for (const central of enphasises[axis])
					if (central < 0) {
						sc_ctx.strokeStyle = $gridColorCentral
						sc_ctx.lineWidth = 2
						drawGridLine(axis, -central)
					}
			}
		}

		// grid focus
		if ($gridCursor) {
			for (const axis of bit) {
				sc_ctx.strokeStyle = $gridCursorColor
				drawGridLine(axis, coordinate[axis])
				drawGridLine(axis, coordinate[axis] + 1)
			}
		}
	}
</script>

<svelte:window
	on:resize={() => {
		getRects()
	}}
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
		bind:contentRect={canvasResize}
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
			on:mouseleave|preventDefault={() => {
				isHover = false
				scDraw()
			}}
			on:mouseenter|preventDefault={() => {
				isHover = true
			}}
			on:mousedown|preventDefault={(e) => {
				if (e.button === 2 /* Right click */) {
					// right click spuit?
				} else {
					isPress = true
					setValue(e)
				}
			}}
			on:mouseenter|preventDefault={(e) => {
				dispatch('mouseenter', { mouseEvent: e, isPress })
			}}
			on:mouseleave|preventDefault={(e) => {
				dispatch('mouseleave', { mouseEvent: e, isPress })
			}}
			on:mousemove|preventDefault={(e) => {
				setValue(e)
				const [x, y] = getXY(e)
				dispatch('mousemove', { mouseEvent: e, x, y, isPress })
			}}
			on:mouseup|preventDefault={() => {
				isPress = false
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
