<script lang="ts">
	import { onMount, type ComponentType } from 'svelte'

	import TableManager from './TableManager.svelte'
	import LifeGameManager from './LifeGameManager.svelte'
	import InitializerSettings from './InitializerSettings.svelte'
	import PixelDraw from './PixelDraw.svelte'

	import Modal from './generic/Modal.svelte'
	import {
		life,
		table,
		modal,
		ModalsHeader,
		selectedColor,
		gridView,
		columns,
		rows,
		penMode,
		gridColorCentral,
	} from './store'
	import { hexToRgb } from '../utils/color.js'

	import { LifeEvent } from '$lib/LifeGame.js'

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

	let settingValue = 1

	selectedColor.subscribe((v) => {
		life.colorManager.setColor(v)
		$table = $table
	})

	const _modal: Record<ModalsHeader, ComponentType> = {
		[ModalsHeader.Random]: InitializerSettings,
	}

	onMount(() => {
		$table = $table
	})
</script>

<svelte:head>
	<title>LifeGame</title>
</svelte:head>

<main style:--color-primary-500={hexToRgb($selectedColor).join(' ')}>
	<div class="tools h-32">
		<TableManager />
		<LifeGameManager />
	</div>

	<PixelDraw
		style={`height: calc(100vh - 8rem);`}
		cells={table}
		gridShow={gridView}
		{gridColorCentral}
		on:drawDot={(e) => {
			const { ctx, x, y } = e.detail
			const cell = life.cells.get(x, y)
			if (cell > 0 || cell === -1) {
				ctx.fillStyle = life.getColor(cell)
				ctx.fillRect(x, y, 1, 1)
			}
		}}
		on:optionDraw={(e) => {
			const { ctx, x, y } = e.detail
			if ($penMode > 0) {
				// UNDEAD TOMB
				ctx.beginPath()
				// const w = width / columns
				// // const w = Math.round(x * cell_size)
				// ctx.moveTo(x , y)
				// ctx.lineTo(w, height)
				// ctx.closePath()
				// ctx.stroke()

				// const cell_size_h = height / rows
				// const h = Math.round(y * cell_size_h)
				// ctx.moveTo(0, h)
				// ctx.lineTo(width, h)
				// ctx.closePath()
				// ctx.stroke()
			}
		}}
		on:setValue={(e) => {
			const { x, y, mouseEvent } = e.detail
			if (mouseEvent.type === 'mousedown') {
				settingValue = $table[y][x] ? 0 : -$penMode || 1
			}

			life.cells.setValue(e.detail, settingValue)
			life.emit(LifeEvent.UPDATE)
		}}
	/>

	{#if $modal}
		<Modal on:close={() => ($modal = null)}>
			<svelte:component this={_modal[$modal]} />
		</Modal>
	{/if}
</main>

<style>
	main {
		position: relative;
		width: 100%;
		min-width: 320px;
		height: 100%;
		text-align: center;

		/* display: flex; */
		/* align-items: center; */
		/* justify-content: space-between; */
	}
</style>
