<script lang="ts">
	// import type { Cell } from '$lib/LifeGame'

	import { life, columns, rows, initSettingsOpen } from './store'

	import lexicon from '../resource/lexicon.json'
	// import Patterns from '../resource/patterns.json'

	import SVG from '../resource/sprite.svg'

	// const patterns = Patterns as unknown as [string, Cell[][]][]
</script>

<nav>
	<button
		on:click={() => {
			life.randomInit()
		}}
		>Random
	</button>

	<button on:click={() => ($initSettingsOpen = true)}>
		<svg>
			<use href="{SVG}#settings" />
		</svg>
	</button>

	<button
		on:click={() => {
			if (life.isRunning) {
				life.stop()
			}

			life.init()
		}}
		>Clear
	</button>

	<button
		on:click={() => {
			life.reverse()
		}}
		>Reverse
	</button>

	<button
		on:click={() => {
			if (life.isRunning) {
				life.stop()
			}
			life.reset()
		}}
		>Reset
	</button>
	<button
		on:click={() => {
			navigator.clipboard.writeText(life.memory())
		}}
		>Copy
	</button>

	<label>
		<select class="pulldown">
			{#each Object.entries(lexicon) as [name, lexico], i}
				<option
					value={i}
					on:click={() => {
						$columns = life.columns
						$rows = life.rows
						life.insert(lexico)
						life.memory()
					}}>{i}: {name}</option
				>
			{/each}
		</select>
	</label>

	<!-- <label>
		<select class="pulldown">
			{#each patterns as [name, _rule], i}
				<option
					value={i}
					on:click={() => {
						$columns = life.columns
						$rows = life.rows
						life.insert(_rule)
						life.memory()
					}}>{name}</option
				>
			{/each}
		</select>
	</label> -->
</nav>
