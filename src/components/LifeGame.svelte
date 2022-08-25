<script lang="ts">
	import GridTable from './GridTable.svelte'
	import TableManager from './TableManager.svelte'
	import TableInitializer from './TableInitializer.svelte'
	import LifeGameManager from './LifeGameManager.svelte'
</script>

<svelte:head>
	<title>LifeGame</title>
</svelte:head>

<section>
	<TableManager />
	<TableInitializer />
	<LifeGameManager />
	<GridTable />
</section>

<style>
	section {
		position: relative;
		width: 100%;
		height: 100%;
		text-align: center;

		/* display: flex; */
		/* align-items: center; */
		/* justify-content: space-between; */
	}
</style>
