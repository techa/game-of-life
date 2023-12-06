<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte'
	import { readable, type Writable } from 'svelte/store'

	type DrawEvent = MouseEvent & {
		currentTarget: EventTarget & HTMLCanvasElement
	}

	const dispatch = createEventDispatcher<{
		mouseup: {
			x: number
			y: number
			mouseEvent: MouseEvent & {
				currentTarget: EventTarget & Window
			}
		}
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
			w: number
			h: number
			screen: CanvasRenderingContext2D
			dots: CanvasRenderingContext2D
			pen: boolean
		}
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
	export let gridCentral = readable(true)
	export let gridCursorColor = readable('#ccc')
	export let gridColor = readable('#333')
	export let gridColorEmphasis = readable('#555')
	export let gridColorCentral = readable('#188')

	export let viewMode = readable<'full' | 'fit'>('fit')

	/**
	 * pixels size width
	 */
	let columns = 32
	/**
	 * pixels size height
	 */
	let rows = 24
	let dots_canvas: HTMLCanvasElement
	let screen_canvas: HTMLCanvasElement
	let grid_canvas: HTMLCanvasElement

	/**
	 * screen size width
	 */
	let width = 120
	/**
	 * screen size height
	 */
	let height = 120
	let dots: CanvasRenderingContext2D
	let screen: CanvasRenderingContext2D
	let grid: CanvasRenderingContext2D

	let pixel_draw: HTMLDivElement

	let canvas_wapper: HTMLDivElement
	let canvasRect: DOMRect
	let canvasResize: DOMRect

	let isPress = false
	let isHover = false

	onMount(() => {
		const dots_ctx = dots_canvas.getContext('2d')
		const screen_ctx = screen_canvas.getContext('2d')
		const grid_ctx = grid_canvas.getContext('2d')
		if (dots_ctx && screen_ctx && grid_ctx) {
			dots = dots_ctx
			screen = screen_ctx
			grid = grid_ctx
		} else {
			console.error(`canvas.getContext('2d') returns null`)
		}
		getRects()
	})

	function getRects() {
		// console.log('getRects')
		canvasRect = canvas_wapper.getBoundingClientRect()
	}

	$: if (canvasResize) {
		console.log('resize')
		getRects()
		gridDraw()
		pxDraw()
	}

	let enphasises: number[][] = [[], []]

	$: if (canvas_wapper) {
		console.log('cells update')
		columns = $cells[0].length
		rows = $cells.length
		enphasises = [enphasisIndexes(columns), enphasisIndexes(rows)]
		const boxRect = pixel_draw.getBoundingClientRect()
		switch ($viewMode) {
			case 'full':
				width = boxRect.width
				height = boxRect.height
				break
			case 'fit':
			default:
				{
					const w = boxRect.width / columns
					const h = boxRect.height / rows
					const boxRatio = boxRect.width / boxRect.height
					const canvasRatio = w / h
					if (boxRatio > canvasRatio) {
						if (rows * w > boxRect.height) {
							width = columns * h
							height = boxRect.height
						} else {
							width = boxRect.width
							height = rows * w
						}
					} else {
						if (columns * h > boxRect.width) {
							width = boxRect.width
							height = rows * w
						} else {
							width = columns * h
							height = boxRect.height
						}
					}
				}
				break
		}
	}

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

	// from mouse position (float) to cell position (int)
	const toX = (x: number) => (x * (columns / width)) | 0
	const toY = (y: number) => (y * (rows / height)) | 0

	// from cell position (int) to mouse position (float)
	const fromX = (x: number) => x * (width / columns)
	const fromY = (y: number) => y * (height / rows)

	function getXY(e: MouseEvent): [number, number] {
		const { x: boxPositionX, y: boxPositionY } = canvasRect

		return [toX(e.clientX - boxPositionX), toY(e.clientY - boxPositionY)]
	}

	// vector origin
	let beginning: null | [number, number] = null
	function setValue(e: DrawEvent) {
		if (isPress) {
			const { x: boxPositionX, y: boxPositionY } = canvasRect

			const mouseXinBox = e.clientX - boxPositionX
			const mouseYinBox = e.clientY - boxPositionY

			const draw = ([x, y]: [number, number]) => {
				dispatch('setValue', { ctx: dots, x, y, mouseEvent: e })
				drawDot([x, y], true)
			}

			if (beginning) {
				// penCross
				const minX = toX(Math.min(beginning[0], mouseXinBox))
				const minY = toX(Math.min(beginning[1], mouseYinBox))
				const maxX = toY(Math.max(beginning[0], mouseXinBox))
				const maxY = toY(Math.max(beginning[1], mouseYinBox))
				for (let y = minY; y <= maxY; y++) {
					for (let x = minX; x <= maxX; x++) {
						// cell vertexes
						const cellRectPoints = [
							[fromX(x), fromY(y)],
							[fromX(x + 1), fromY(y)],
							[fromX(x), fromY(y + 1)],
							[fromX(x + 1), fromY(y + 1)],
						]

						const vector1 = [
							mouseXinBox - beginning[0],
							mouseYinBox - beginning[1],
						]

						let sign = 0
						for (let i = 0; i < cellRectPoints.length; i++) {
							const [px, py] = cellRectPoints[i]
							const vector2 = [
								px - beginning[0],
								py - beginning[1],
							]

							// cross product
							// vec1.x * vec2.y - vec1.y * vec2.x
							const cross =
								vector1[0] * vector2[1] -
								vector1[1] * vector2[0]

							if (i === 0) {
								sign = Math.sign(cross)
							} else if (sign !== Math.sign(cross)) {
								draw([x, y])
								break
							}
						}
					}
				}
			} else {
				draw(getXY(e))
			}
			beginning = [mouseXinBox, mouseYinBox]
		}
	}

	function drawDot([x, y]: [number, number], pen = false) {
		const w = width / columns
		const h = height / rows
		dispatch('drawDot', { dots: dots, screen: screen, x, y, w, h, pen })
	}

	function pxDraw() {
		if (dots && screen && grid) {
			dots.clearRect(-1, -1, columns + 1, rows + 1)
			screen.clearRect(-1, -1, columns + 1, rows + 1)
			for (let y = 0; y < rows; y++) {
				for (let x = 0; x < columns; x++) {
					drawDot([x, y])
				}
			}
		}
		console.log('pxDraw')
	}

	function drawGridLine(axis: number, i: number) {
		grid.beginPath()
		if (!axis) {
			const cell_size = width / columns
			const w = Math.round(i * cell_size)
			grid.moveTo(w, 0)
			grid.lineTo(w, height)
		} else {
			const cell_size = height / rows
			const h = Math.round(i * cell_size)
			grid.moveTo(0, h)
			grid.lineTo(width, h)
		}
		grid.closePath()
		grid.stroke()
	}

	gridShow.subscribe(() => gridDraw())
	gridCentral.subscribe(() => gridDraw())
	gridCursor.subscribe(() => gridDraw())
	function gridDraw(coordinate: [number, number] = [-2, -2]) {
		if (!grid) {
			return
		}
		grid.clearRect(-1, -1, width + 2, height + 2)
		const bit = [0, 1]

		if ($gridShow) {
			const sizes = [columns, rows]

			// draw base grid line
			for (const axis of bit) {
				const colrow = sizes[axis]
				for (let i = 0; i <= colrow; i++) {
					grid.strokeStyle = $gridColor
					grid.lineWidth = 1
					drawGridLine(axis, i)
				}
			}
			// draw emphasis line
			for (const axis of bit) {
				for (const emphasis of enphasises[axis])
					if (emphasis > 0) {
						grid.strokeStyle = $gridColorEmphasis
						grid.lineWidth = 2
						drawGridLine(axis, emphasis)
					}
			}

			if ($gridCentral) {
				// draw central line
				for (const axis of bit) {
					for (const central of enphasises[axis])
						if (central < 0) {
							grid.strokeStyle = $gridColorCentral
							grid.lineWidth = 2
							drawGridLine(axis, -central)
						}
				}
			}
		}

		// grid focus
		if ($gridCursor) {
			for (const axis of bit) {
				grid.strokeStyle = $gridCursorColor
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
			gridDraw(getXY(e))
		}
	}}
	on:mouseup={(e) => {
		if (isPress) {
			beginning = null

			gridDraw()
			const [x, y] = getXY(e)
			dispatch('mouseup', { mouseEvent: e, x, y })

			isPress = false
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
		bind:contentRect={canvasResize}
	>
		<canvas
			class="px_canvas"
			bind:this={dots_canvas}
			width={columns}
			height={rows}
		/>
		<canvas class="ut_canvas" bind:this={screen_canvas} {width} {height} />
		<canvas
			class="sc_canvas"
			bind:this={grid_canvas}
			{width}
			{height}
			on:mouseleave|preventDefault={() => {
				isHover = false
				gridDraw()
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
				if (isPress) {
					setValue(e)
				}
				const [x, y] = getXY(e)
				dispatch('mousemove', { mouseEvent: e, x, y, isPress })
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
