<!-- Copy from Skeleton https://github.com/skeletonlabs/skeleton/blob/dev/packages/skeleton/src/lib/components/Table/Table.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte'

	import { tableA11y } from '../actions/table.js'

	// Types
	import type {
		CssClasses,
		SvelteEvent,
		TableSource,
	} from '@skeletonlabs/skeleton'

	// Event Dispatcher
	type TableEvent = {
		selected: string[]
	}
	const dispatch = createEventDispatcher<TableEvent>()

	// Props
	/**
	 * Provide the full set of table source data.
	 * @type {TableSource}
	 */
	export let source: TableSource
	/** Enables row hover style and `on:selected` event when rows are clicked. */
	export let interactive = false

	// Props (styles)
	/** Override the Tailwind Element class. Replace this for a headless UI. */
	export let element: CssClasses = 'table'
	/** Provide classes to set the table text size. */
	export let text: CssClasses = ''
	/** Provide classes to set the table text color. */
	export let color: CssClasses = ''
	/** Provide arbitrary classes for the table head. */
	export let regionHead: CssClasses = ''
	/** Provide arbitrary classes for the table head cells. */
	export let regionHeadCell: CssClasses = ''
	/** Provide arbitrary classes for the table body. */
	export let regionBody: CssClasses = ''
	/** Provide arbitrary classes for the table cells. */
	export let regionCell: CssClasses = ''
	/** Provide arbitrary classes for the table foot. */
	export let regionFoot: CssClasses = ''
	/** Provide arbitrary classes for the table foot cells. */
	export let regionFootCell: CssClasses = ''

	export let selectingRowIndex = -1

	// Row Click Handler
	function onRowClick(
		event: SvelteEvent<MouseEvent | KeyboardEvent, HTMLTableRowElement>,
		rowIndex: number,
	): void {
		if (!interactive) return
		event.preventDefault()
		event.stopPropagation()
		// Prefer meta row info if available, else fallback to body row info
		const rowMetaData = source.meta
			? source.meta[rowIndex]
			: source.body[rowIndex]
		/** @event {rowMetaData} selected - Fires when a table row is clicked. */
		dispatch('selected', rowMetaData)
	}

	// Row Keydown Handler
	function onRowKeydown(
		event: SvelteEvent<KeyboardEvent, HTMLTableRowElement>,
		rowIndex: number,
	): void {
		if (['Enter', 'Space'].includes(event.code)) onRowClick(event, rowIndex)
	}

	// Reactive
	$: classesBase = `${$$props.class || ''}`
	$: classesTable = `${element} ${text} ${color}`
</script>

<div class="table-container {classesBase}">
	<!-- Table -->
	<!-- prettier-ignore -->
	<table
		class="{classesTable}"
		class:table-interactive={interactive}
		role={interactive ? "grid" : "table"}
		use:tableA11y
	>
		<!-- on:keydown={(e) => onTableKeydown(elemTable, e)} -->
		<!-- Head -->
		<thead class="table-head {regionHead}">
			<tr>
				{#each source.head as heading }
					<th class="{regionHeadCell}" role="columnheader">{heading}</th>
				{/each}
			</tr>
		</thead>
		<!-- Body -->
		<tbody class="table-body {regionBody}">
			{#each source.body as row, rowIndex}
				<!-- Row -->
				<!-- prettier-ignore -->
				<!-- Add selecting style .bg-tertiary-700-->
				<tr
					style:background-color={selectingRowIndex === rowIndex ? 'rgb(var(--color-primary-500) / 0.08)' : ''}
					on:click={(e) => {
						onRowClick(e, rowIndex);
						selectingRowIndex = rowIndex;
					}}
					on:keydown={(e) => { onRowKeydown(e, rowIndex); }}
					aria-rowindex={rowIndex + 1}
				>
					{#each row as cell, cellIndex}
						<!-- Cell -->
						<td
							class="{regionCell}"
							role="gridcell"
							aria-colindex={cellIndex + 1}
							tabindex={cellIndex === 0 && interactive ? 0 : -1}
						>
							{Number(cell) === 0 ? cell : (cell ? cell : '-')}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
		<!-- Foot -->
		{#if source.foot}
			<tfoot class="table-foot {regionFoot}">
				<tr>
					{#each source.foot as cell }
						<td class="{regionFootCell}">{cell}</td>
					{/each}
				</tr>
			</tfoot>
		{/if}
	</table>
</div>
