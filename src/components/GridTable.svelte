<script lang="ts">
	import { onMount } from 'svelte'
	import { NextColor, type NextColorType } from '../utils/color'
	import { Cell, LifeEvent } from '$lib/LifeGame'
	import {
		life,
		table,
		columns,
		rows,
		selectedColor,
		gridView,
		generation,
		population,
	} from './store'

	const cell_size = 10
	$: width = $columns * cell_size
	$: height = $rows * cell_size

	export let drawMode = Cell.LIVE

	let colors = [
		'transparent', // DEATH, TOMB
		$selectedColor, // LIVE, UNDEAD
		// 'red',
		// 'orange',
		// 'yellow',
		// '#60ff00', // lime
		// 'cyan',
		// '#0060ff', // blue
		// 'magenta',
		// 'white',
		// 'lightgray',
		// 'gray',
		// 'darkgray',
	]

	let nextColorType: NextColorType = 'random'
	let nextColor = NextColor[nextColorType]

	function cellColor(celltype: number) {
		if (celltype < 0) {
			celltype += 2
		}
		let color = colors[celltype]
		if (!color) {
			colors.push(
				(color = nextColor(colors[celltype - 1] || $selectedColor)),
			)
			// console.log(`%c${color}`, `color:${color};font-weight:bold;`)
		}
		return color
	}

	let canvas: HTMLCanvasElement
	let ctx: CanvasRenderingContext2D
	onMount(() => {
		ctx = canvas.getContext('2d')
	})

	let isPress = false

	function draw(e, mousedown?: (x: number, y: number) => void) {
		const {
			x: boxx,
			y: boxy,
			width,
			height,
		} = e.currentTarget.getBoundingClientRect()

		const x = (((e.clientX - boxx) * $columns) / width) | 0
		const y = (((e.clientY - boxy) * $rows) / height) | 0
		if (mousedown) {
			mousedown(x, y)
		}
		life.table[y][x] = drawMode
		life.emit(LifeEvent.UPDATE)
	}

	life.on(LifeEvent.UPDATE, () => {
		$table = life.table
		$generation = life.generation
		$population = life.population
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
						ctx.fillStyle = cellColor($table[y][x])
						ctx.fillRect(x, y, 1, 1)
					} else break
				}
			}
			// console.log('canvas redraw')
		}
	}

	table.subscribe(redraw)

	selectedColor.subscribe(() => {
		// Reload colors
		colors = [
			'transparent', // DEATH, TOMB
			$selectedColor, // LIVE, UNDEAD
		]
		for (let i = 2; i < life.cycle; i++) {
			cellColor(i)
		}
		redraw()
	})
</script>

<svelte:window
	on:mouseup={() => {
		isPress = false
	}}
/>

<div class="table">
	<canvas
		bind:this={canvas}
		width={$columns}
		height={$rows}
		style:width={width + 'px'}
		style:height={height + 'px'}
	/>
	<!-- svelte-ignore component-name-lowercase -->
	<table
		class:gridView={$gridView}
		style:width={width + 'px'}
		style:height={height + 'px'}
		on:mousedown|preventDefault={(e) => {
			draw(e, (x, y) => {
				drawMode = +!$table[y][x]
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
	.table {
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
	table.gridView td {
		border: dashed 1px #888;
	}
</style>
