<script lang="ts">
	// import type { Cell } from '$lib/LifeGame'

	import { life, modal, ModalsHeader } from './store'

	import lexicon from '../resource/lexicon.min.json'
	// import Patterns from '../resource/patterns.json'

	import SVG from '../resource/sprite.svg'

	// const patterns = Patterns as unknown as [string, Cell[][]][]
</script>

<nav>
	<div class="btn-group primary-color">
		<button
			on:click={() => {
				life.randomInit()
			}}
			>Randomize!
		</button>

		<button on:click={() => ($modal = ModalsHeader.Random)}>
			<svg>
				<use href="{SVG}#settings" />
			</svg>
		</button>
	</div>

	<button
		class="btn-icon bg-initial"
		on:click={() => {
			life.clear()
		}}
	>
		<svg>
			<use href="{SVG}#trash" />
		</svg>
	</button>

	<button
		class="btn-icon bg-initial"
		on:click={() => {
			life.reverse()
		}}
	>
		<svg>
			<use href="{SVG}#arrow-right-left" />
		</svg>
	</button>

	<!-- <button
		on:click={() => {
			navigator.clipboard.writeText(life.toString())
		}}
		>Copy
	</button> -->

	<label>
		<select class="pulldown select">
			{#each lexicon as { n, d }, i}
				<option
					value={i}
					on:click={() => {
						life.lexicon(d)
					}}>{i}: {n}</option
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
