<script lang="ts">
	import { SlideToggle } from '@skeletonlabs/skeleton'
	import { autoConway } from '../store.js'
</script>

<div class="tools-settings text-left">
	<h3>Setting</h3>
	<p>
		<SlideToggle
			name="auto-conway"
			bind:checked={$autoConway}
			active="bg-primary-500">Auto set Conway's life</SlideToggle
		>
	</p>
</div>
