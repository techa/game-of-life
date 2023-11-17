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

	import DropDown from './generic/DropDown.svelte'
	import Slider from './generic/Slider.svelte'

	import SVG from '../resource/sprite.svg'
	import { LifeEvent } from '$lib/LifeGame'

	function resize() {
		life.tableSizing($columns, $rows)
	}
</script>

<nav>
	<a href="https://github.com/techa/game-of-life">
		<svg style="stroke: #fff;">
			<use href="{SVG}#github" />
		</svg>
	</a>

	<DropDown>
		<button
			class="color"
			slot="trigger"
			style:background-color={$selectedColor}
		/>
		<div class="color-choose">
			<Slider
				style={'width:8rem;'}
				max={359}
				on:change={(e) => ($selectedColor = `hsl(${e.detail},86%,68%)`)}
				gradient={[
					'red',
					'yellow',
					'lime',
					'cyan',
					'blue',
					'magenta',
					'red',
				]}
				--background-color={$selectedColor}
			/>
		</div>
	</DropDown>

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
</nav>

<style>
	.color {
		width: 1.5rem;
		height: 1.5rem;
		border: none;
		padding: 0;
		border-radius: 50%;
	}
	.color-choose {
		padding: 8px;
		background-color: var(--black);
	}
	input[type='number'] {
		width: 3rem;
	}
</style>
