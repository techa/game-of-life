<script lang="ts">
	import { onMount, type ComponentType } from 'svelte'

	import GridTable from './GridTable.svelte'
	import TableManager from './TableManager.svelte'
	import LifeGameManager from './LifeGameManager.svelte'
	import InitializerSettings from './InitializerSettings.svelte'

	import Modal from './generic/Modal.svelte'
	import { table, modal, ModalsHeader, selectedColor } from './store'
	import { hexToRgb } from '../utils/color.js'

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
	<GridTable />

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
