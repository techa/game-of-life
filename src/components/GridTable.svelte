<script lang="ts">
	import { type LifeGame, Cell, LifeEvent } from '$lib/LifeGame'

	const cell_size = 10

	export let life: LifeGame
	export let table: Cell[][]
	export let columns: number
	export let rows: number
	export let gridView = false
	export let drawMode = Cell.LIVE
	export let selectedColor = 'transparent'

	const colors = [
		'transparent',
		selectedColor,
		'red',
		'orange',
		'yellow',
		'lime',
		'cyan',
		'blue',
		'magenta',
		'white',
		'lightgray',
		'gray',
		'darkgray',
	]

	function cellColor(celltype: number) {
		let color =
			celltype < 0 // if cell is UNDEAD
				? selectedColor
				: colors[celltype]
		if (!color) {
			colors.push((color = '#' + Math.random().toString(16).slice(-6)))
		}
		return color
	}

	let isPress = false

	function draw(e, mousedown?: (x: number, y: number) => void) {
		const {
			x: boxx,
			y: boxy,
			width,
			height,
		} = e.currentTarget.getBoundingClientRect()

		// cursor.style.top =
		// 	(((e.clientY * life.rows) / height) | 0) * cell_size + 'px'
		// cursor.style.left =
		// 	(((e.clientX * life.columns) / width) | 0) * cell_size + 'px'
		const x = (((e.clientX - boxx) * columns) / width) | 0
		const y = (((e.clientY - boxy) * rows) / height) | 0
		if (mousedown) {
			mousedown(x, y)
		}
		life.table[y][x] = drawMode
		life.emit(LifeEvent.TABLE_UPDATE)
	}
</script>

<svelte:window
	on:mouseup={() => {
		isPress = false
	}}
/>

<div class="table">
	<table
		class:gridView
		style:width={columns * cell_size + 'px'}
		style:height={rows * cell_size + 'px'}
		on:mousedown|preventDefault={(e) => {
			draw(e, (x, y) => {
				drawMode = +!table[y][x]
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
		{#each table as row}
			<tr>
				{#each row as celltype}
					<td
						class="tile"
						style:width={cell_size + 'px'}
						style:height={cell_size + 'px'}
						style:background-color={cellColor(celltype)}
					/>
				{/each}
			</tr>
		{/each}
		<!-- <div
				class="cursor"
				style:background-color={selectedColor}
				bind:this={cursor}
			/> -->
	</table>
</div>

<style>
	.table {
		width: 100%;
		text-align: center;
		display: flex;
		justify-content: center;
	}
	table,
	tr,
	td {
		padding: 0;
		margin: 0;
		line-height: 0;
		box-sizing: border-box;
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
