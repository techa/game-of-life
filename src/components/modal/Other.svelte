<script lang="ts">
	import { SlideToggle } from '@skeletonlabs/skeleton'
	import { autoConway } from '../store.js'
</script>

<div class="text-left">
	<h3 class="h3">Setting</h3>
	<p>
		<SlideToggle
			name="auto-conway"
			bind:checked={$autoConway}
			active="bg-primary-500"
			>Auto set "Conway's life" when a template is selected
		</SlideToggle>
	</p>
</div>
