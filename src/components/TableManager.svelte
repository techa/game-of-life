<script lang="ts">
	import {
		life,
		columns,
		rows,
		edgeCell,
		selectedColor,
		gridView,
		penMode,
	} from './store'

	import SVG from '../resource/sprite.svg'
	import { LifeEvent } from '$lib/LifeGame'

	function resize() {
		life.tableSizing({})
	}
</script>

<nav>
	<a href="https://github.com/techa/life-game">
		<svg style="stroke: #fff;">
			<use href="{SVG}#github" />
		</svg>
	</a>
	<label>
		<input type="color" bind:value={$selectedColor} />
	</label>
	<label>
		<svg class:active={$gridView}>
			<use href="{SVG}#grid" />
		</svg>
		<input type="checkbox" class="hidden" bind:checked={$gridView} />
	</label>
	<label
		>W:
		<input type="number" bind:value={$columns} on:input={resize} min="1" />
	</label>
	<label
		>H:
		<input type="number" bind:value={$rows} on:input={resize} min="1" />
	</label>

	<button on:click={() => ($edgeCell += 1)}>
		<svg>
			<use href="{SVG}#repeat" />
		</svg>
		{#if $edgeCell === -2}
			Tomb
		{:else if $edgeCell === -1}
			Uudead
		{:else}
			Loop
		{/if}
	</button>

	<button
		on:click={() => {
			life.rotate()
			setTimeout(() => life.emit(LifeEvent.UPDATE), 100)
		}}
		>Rotate
	</button>

	<svg
		style:stroke={$penMode < 2 ? $selectedColor : 'currentColor'}
		on:click={() => console.log(($penMode += 1))}
	>
		<use href="{SVG}#pen" />
		{#if $penMode}
			<use
				href="{SVG}#x"
				x="14px"
				y="14px"
				width="10px"
				height="10px"
				stroke-width="4px"
			/>
		{/if}
	</svg>

	<button
		on:click={() => {
			life.reverse()
		}}
		>Reverse
	</button>
</nav>

<style>
	input[type='color'] {
		width: 1.5rem;
		border: none;
		padding: 0;
		border-radius: 50%;
	}
	input[type='number'] {
		width: 3rem;
	}
</style>
