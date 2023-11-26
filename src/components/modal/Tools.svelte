<script lang="ts">
	import { SlideToggle } from '@skeletonlabs/skeleton'
	import { gridCentral, tooltipShow, autoConway } from '../store.js'
</script>

<div class="tools-settings text-left">
	<h3>Grid</h3>
	<p>
		<SlideToggle
			name="grid-emphasis-line"
			bind:checked={$gridCentral}
			active="bg-primary-500"
			>Emphasis Line {$gridCentral ? '' : 'in'}visible</SlideToggle
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
	<h3>Setting</h3>
	<p>
		<SlideToggle
			name="auto-conway"
			bind:checked={$autoConway}
			active="bg-primary-500">Auto set Conway's life</SlideToggle
		>
	</p>
</div>
