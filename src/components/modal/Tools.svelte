<script lang="ts">
	import { SlideToggle } from '@skeletonlabs/skeleton'
	import {
		tableViewMode,
		gridCentral,
		tooltipShow,
		autoConway,
	} from '../store.js'

	let tableFull = false
	$: {
		$tableViewMode = tableFull ? 'full' : 'fit'
	}
</script>

<div class="tools-settings text-left">
	<h3 class="h3">Cells Table</h3>
	<p>
		<SlideToggle
			name="cell-table-view-mode"
			bind:checked={tableFull}
			active="bg-primary-500"
			>Cell Table view mode: <span class="capitalize"
				>{$tableViewMode}</span
			></SlideToggle
		>
	</p>

	<h3 class="h3">Grid</h3>
	<p>
		<SlideToggle
			name="grid-central-line"
			bind:checked={$gridCentral}
			active="bg-primary-500"
			>Central Line {$gridCentral ? '' : 'in'}visible</SlideToggle
		>
	</p>
	<p>
		<SlideToggle
			name="tooltip-show"
			bind:checked={$tooltipShow}
			active="bg-primary-500"
			>Cursor Tooltip {$tooltipShow ? 'Show' : 'Hide'}</SlideToggle
		>
	</p>

	<h3 class="h3">Setting</h3>
	<p>
		<SlideToggle
			name="auto-conway"
			bind:checked={$autoConway}
			active="bg-primary-500">Auto set Conway's life</SlideToggle
		>
	</p>
</div>
