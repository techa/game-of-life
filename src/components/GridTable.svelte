<script lang="ts">
	import { onMount } from 'svelte'
	import { Cell, LifeEvent } from '$lib/LifeGame'
	import {
		life,
		table,
		columns,
		rows,
		gridShow,
		selectedColor,
		penMode,
	} from './store'

	const cell_size = 10
	$: width = $columns * cell_size
	$: height = $rows * cell_size

	export let drawMode = Cell.LIVE

	let canvas: HTMLCanvasElement
	let ctx: CanvasRenderingContext2D
	let tableRect: DOMRect
	onMount(() => {
		ctx = canvas.getContext('2d') as CanvasRenderingContext2D
		tableRect = canvas.getBoundingClientRect()
	})

	let isPress = false

	type DrawEvent = MouseEvent & {
		currentTarget: EventTarget & HTMLElement
	}

	function draw(e: DrawEvent, mousedown?: (x: number, y: number) => void) {
		const { x: boxx, y: boxy, width, height } = tableRect
		const x = (((e.clientX - boxx) * $columns) / width) | 0
		const y = (((e.clientY - boxy) * $rows) / height) | 0
		if (mousedown) {
			mousedown(x, y)
		}
		life.cells.setValue({ x, y }, drawMode)
		life.emit(LifeEvent.UPDATE)
	}

	life.on(LifeEvent.UPDATE, () => {
		$table = life.cells.get2d()
		// console.log('UPDATE')
	})

	life.on(LifeEvent.TABLE_UPDATE, () => {
		$columns = life.columns
		$rows = life.rows
		life.emit(LifeEvent.UPDATE)
		// console.log('TABLE_UPDATE')
	})

	const redraw = () => {
		if (ctx) {
			ctx.clearRect(0, 0, $columns, $rows)
			for (let y = 0; y < $rows; y++) {
				for (let x = 0; x < $columns; x++) {
					if ($table[y]) {
						ctx.fillStyle = life.getColor($table[y][x])
						ctx.fillRect(x, y, 1, 1)
					} else break
				}
			}
			// console.log('canvas redraw')
		}
	}

	table.subscribe(redraw)

	selectedColor.subscribe((v) => {
		life.colorManager.setColor(v)
		redraw()
	})
</script>

<svelte:window
	on:mouseup={() => {
		isPress = false
	}}
/>

<div class="cells-table">
	<canvas
		bind:this={canvas}
		width={$columns}
		height={$rows}
		style:width={width + 'px'}
		style:height={height + 'px'}
	/>

	<table
		class:gridShow={$gridShow}
		style:width={width + 'px'}
		style:height={height + 'px'}
		role="presentation"
		on:mousedown|preventDefault={(e) => {
			tableRect = canvas.getBoundingClientRect()
			draw(e, (x, y) => {
				drawMode = $table[y][x] ? Cell.DEATH : -$penMode || 1
			})
			isPress = true
		}}
		on:mouseup|preventDefault={() => {
			isPress = false
		}}
		on:mousemove|preventDefault={(e) => {
			if (isPress) {
				draw(e)
			}
		}}
	>
		{#each $table as row}
			<tr>
				{#each row as celltype}
					<td
						class="tile"
						class:undead={celltype === -1}
						class:tomb={celltype === -2}
						style:width={cell_size + 'px'}
						style:height={cell_size + 'px'}
					/>
					<!-- without canvas
						style:background-color={cellColor(celltype)}
					-->
				{/each}
			</tr>
		{/each}
	</table>
</div>

<style>
	.cells-table {
		position: relative;
		width: 100%;
		text-align: center;
		display: flex;
		justify-content: center;
		overflow: auto;
	}
	canvas {
		position: absolute;
		width: 100%;
		height: 100%;

		image-rendering: pixelated;

		z-index: -1;
	}
	table,
	tr,
	td {
		padding: 0;
		margin: 0;
		line-height: 0;
		box-sizing: border-box;
	}
	td.undead {
		background-image: linear-gradient(
				to top right,
				transparent 45%,
				black 45%,
				black 55%,
				transparent 55%,
				transparent
			),
			linear-gradient(
				to top left,
				transparent 45%,
				black 45%,
				black 55%,
				transparent 55%,
				transparent
			);
	}
	td.tomb {
		background-image: linear-gradient(
				to top right,
				transparent 45%,
				#888 45%,
				#888 55%,
				transparent 55%,
				transparent
			),
			linear-gradient(
				to top left,
				transparent 45%,
				#888 45%,
				#888 55%,
				transparent 55%,
				transparent
			);
	}
	table {
		width: 100%;
		height: 100%;
		text-align: center;
		border: solid 1px #888;
		border-collapse: collapse;
	}
	table.gridShow td {
		border: dashed 1px #888;
	}
</style>
