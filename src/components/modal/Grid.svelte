<script lang="ts">
	import { SlideToggle } from '@skeletonlabs/skeleton'
	import {
		tableViewMode,
		gridCentral,
		tooltipShow,
		gridEmphasis,
		gridShow,
		gridCursor,
	} from '../store.js'

	let tableFull = false
	$: {
		$tableViewMode = tableFull ? 'full' : 'fit'
	}

	function gEmValidator(
		e: Event & {
			currentTarget: EventTarget & HTMLInputElement
		},
	) {
		const value = e.currentTarget.value
		const gem = value.split(/[, .]/).map((v) => parseInt(v || '1'))
		gem[0] ??= 1
		gem[1] ??= gem[0]
		$gridEmphasis = gem
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
			bind:checked={$gridShow}
			active="bg-primary-500"
			><strong>Grid Show:</strong>
			{$gridShow ? '' : 'in'}visible</SlideToggle
		>
	</p>
	<p>
		<SlideToggle
			name="grid-central-line"
			bind:checked={$gridCentral}
			active="bg-primary-500"
			><strong>Central Line:</strong>
			{$gridCentral ? '' : 'in'}visible</SlideToggle
		>
	</p>
	<p>
		<label
			class="inline-flex rounded-r-none rounded-l-lg break-inside-avoid"
		>
			<input
				class="input font-mono bg-transparent border-0 ring-0 focus:ring-0 focus:border-0 outline-none w-16 h-8 text-center"
				title="Change width of Cells Table"
				value={$gridEmphasis}
				on:input={gEmValidator}
				on:blur={gEmValidator}
				on:keydown={(e) => {
					switch (e.key) {
						case 'Enter':
						case 'Tab':
							gEmValidator(e)
							break
					}
				}}
			/>
			<span class="break-inside-avoid ml-3"
				><strong>Emphasis Line</strong></span
			>
		</label>
	</p>

	<h3 class="h3">Cursor</h3>
	<p>
		<SlideToggle
			name="tooltip-show"
			bind:checked={$gridCursor}
			active="bg-primary-500"
			><strong>Grid Cursor:</strong>
			{$gridCursor ? 'Show' : 'Hide'}</SlideToggle
		>
	</p>
	<p>
		<SlideToggle
			name="tooltip-show"
			bind:checked={$tooltipShow}
			active="bg-primary-500"
			><strong>Cursor Tooltip:</strong>
			{$tooltipShow ? 'Show' : 'Hide'}</SlideToggle
		>
	</p>
</div>
