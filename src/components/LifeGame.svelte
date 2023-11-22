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
		generation,
		population,
		columns,
		rows,
		penMode,
	} from './store'
	import { hexToRgb } from '../utils/color.js'

	import { LifeEvent } from '$lib/LifeGame.js'
	import { writable } from 'svelte/store'

	life.on(LifeEvent.UPDATE, () => {
		$table = life.cells.get2d()
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
	<TableManager />
	<LifeGameManager />
	<PixelDraw
		class="h-4/5"
		cells={table}
		gridShow={gridView}
		gridColorCentral={writable('red')}
		on:drawDot={(e) => {
			const { ctx, x, y } = e.detail
			ctx.fillStyle = life.getColor($table[y][x])

			ctx.fillRect(x, y, 1, 1)
		}}
		on:setValue={(e) => {
			const { x, y } = e.detail
			const cell = life.cells.get(x, y)
			$table[y][x] = cell ? 0 : -$penMode || 1
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
