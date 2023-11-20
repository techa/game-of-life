<script lang="ts">
	import type { ComponentType } from 'svelte'

	import GridTable from './GridTable.svelte'
	import TableManager from './TableManager.svelte'
	import LifeGameManager from './LifeGameManager.svelte'
	import InitializerSettings from './InitializerSettings.svelte'

	import Modal from './generic/Modal.svelte'
	import { modal, ModalsHeader, selectedColor } from './store'

	const _modal: Record<ModalsHeader, ComponentType> = {
		[ModalsHeader.Random]: InitializerSettings,
	}
</script>

<svelte:head>
	<title>LifeGame</title>
</svelte:head>

<main style:--primary-color={$selectedColor}>
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
