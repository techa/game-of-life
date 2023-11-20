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

	import Slider from './generic/Slider.svelte'

	import SVG from '../resource/sprite.svg'
	import { LifeEvent } from '$lib/LifeGame'
	import { lch2rgb } from '../utils/lch2rgb.js'

	import { popup } from '@skeletonlabs/skeleton'
	import type { PopupSettings } from '@skeletonlabs/skeleton'
	import { colorStringToHsl } from '../utils/color.js'

	function resize() {
		life.tableSizing($columns, $rows)
	}

	const popupHueSlider: PopupSettings = {
		event: 'click',
		target: 'popupHueSlider',
		placement: 'bottom',
		// closeQuery: '.color',
	}
</script>

<nav>
	<a class="btn-icon" href="https://github.com/techa/game-of-life">
		<svg style="stroke: #fff;">
			<use href="{SVG}#github" />
		</svg>
	</a>

	<button class="skeleton btn-icon" use:popup={popupHueSlider}>
		<svg class:active={$gridView}>
			<use href="{SVG}#palette" />
		</svg>
	</button>
	<div
		class="color-choose card w-32 shadow-xl py-2 z-10 opacity-0"
		data-popup="popupHueSlider"
	>
		<Slider
			max={359}
			value={colorStringToHsl($selectedColor)[0] || 0}
			on:change={(e) => ($selectedColor = lch2rgb(100, 120, e.detail))}
			gradient={[
				'#ff6aff',
				'#ffac5a',
				'#fffc00',
				'#35ff32',
				'#00fffb',
				'#00ffff',
				'#00ffff',
				'#ffb9ff',
				'#ff6aff',
			]}
			--background-color={$selectedColor}
		/>
	</div>

	<button class="skeleton btn-icon" on:click={() => ($penMode += 1)}>
		<svg style:stroke={$penMode < 2 ? $selectedColor : 'currentColor'}>
			<use href="{SVG}#pencil" />
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
	</button>

	<label class="skeleton btn-icon">
		<svg class:active={$gridView}>
			<use href="{SVG}#grid" />
		</svg>
		<input type="checkbox" class="hidden" bind:checked={$gridView} />
	</label>

	<label
		>W:
		<input
			class="input"
			type="number"
			bind:value={$columns}
			on:input={resize}
			min="1"
		/>
	</label>
	<label
		>H:
		<input
			class="input"
			type="number"
			bind:value={$rows}
			on:input={resize}
			min="1"
		/>
	</label>

	<button class=" btn" on:click={() => ($edgeCell += 1)}>
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
		class=" btn-icon"
		on:click={() => {
			life.rotate()
			setTimeout(() => life.emit(LifeEvent.UPDATE), 100)
		}}
	>
		<svg>
			<use href="{SVG}#rotate-cw" />
		</svg>
	</button>
</nav>

<style>
	/* .color {
		width: 1.5rem;
		height: 1.5rem;
		border: none;
		padding: 0;
		border-radius: 50%;
	} */
	.color-choose {
		padding: 8px;
		background-color: var(--black);
	}
	input[type='number'] {
		width: 3rem;
	}
</style>
