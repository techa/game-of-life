<script lang="ts">
	import {
		life,
		columns,
		rows,
		edgeCell,
		selectedColor,
		gridView,
		penMode,
		modal,
		ModalsHeader,
	} from './store'

	import Slider from './generic/Slider.svelte'

	import SVG from '../resource/sprite.svg'
	import { LifeEvent } from '$lib/LifeGame.js'
	import { lch2rgb } from '../utils/lch2rgb.js'

	import lexicon from '../resource/lexicon.min.json'

	import { popup, Table } from '@skeletonlabs/skeleton'
	import type { PopupSettings, TableSource } from '@skeletonlabs/skeleton'
	import { colorStringToHsl } from '../utils/color.js'

	function resize() {
		life.tableSizing($columns, $rows)
	}

	let popupHueSliderInvisible = true
	const popupHueSlider: PopupSettings = {
		event: 'click',
		target: 'popupHueSlider',
		placement: 'bottom-start',
		state(e) {
			popupHueSliderInvisible = !e.state
		},
	}

	const cellStates = ['LIVE', 'UNDEAD', 'TOMB']

	// Lexicon
	let popupLexiconInvisible = true
	const popupLexicon: PopupSettings = {
		event: 'click',
		target: 'popupLexicon',
		placement: 'bottom',
		closeQuery: '.table_lexicon',
		state(e) {
			popupLexiconInvisible = !e.state
		},
	}
	const meta: string[][] = []
	const lexiconTable: TableSource = {
		// A list of heading labels.
		head: ['No.', 'Name', 'w', 'h'],
		body: lexicon.reduce((bodyArr, { n, d }, i) => {
			const [w, h] = d.split(/[-:]/)
			bodyArr.push([i + '', n, w, h])
			meta.push([d])
			return bodyArr
		}, [] as string[][]),
		meta,
	}
</script>

<nav class="w-full p-1 text-center flex justify-center">
	<button
		class="btn-icon naked popup-trigger"
		title="Color Change"
		use:popup={popupHueSlider}
	>
		<svg style="stroke: rgb(var(--color-primary-500));">
			<use href="{SVG}#palette" />
		</svg>
	</button>
	<div
		class="color-choose card w-32 shadow-xl -mt-2 p-2 z-10 bg-surface-900 rounded-sm"
		class:invisible={popupHueSliderInvisible}
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

	<button
		class="btn-icon naked"
		title="Pen Tool ({cellStates[$penMode]})"
		on:click={() => ($penMode += 1)}
	>
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

	<button
		class="btn-icon naked"
		title="Clear Cells Table"
		on:click={() => {
			life.clear()
		}}
	>
		<svg>
			<use href="{SVG}#trash" />
		</svg>
	</button>

	<button
		class="btn-icon naked"
		title="Rotate Cells Table 90deg"
		on:click={() => {
			life.rotate()
			setTimeout(() => life.emit(LifeEvent.UPDATE), 100)
		}}
	>
		<svg>
			<use href="{SVG}#rotate-cw" />
		</svg>
	</button>

	<button
		class="btn-icon naked"
		title="Reverse Cells Cell-Live <--> Cell-Dead"
		on:click={() => {
			life.reverse()
		}}
	>
		<svg>
			<use href="{SVG}#exchange" />
		</svg>
	</button>

	<button
		class="btn-icon naked"
		title="Randomize Cells Table"
		on:click={() => {
			life.randomInit()
		}}
	>
		<svg>
			<use href="{SVG}#dice" />
		</svg>
	</button>

	<button
		id="lexicon"
		class="btn-icon naked popup-trigger"
		title="Template Data Load"
		use:popup={popupLexicon}
	>
		<svg>
			<use href="{SVG}#book-marked" />
		</svg>
	</button>
	<div
		class="card shadow-xl overflow-y-scroll h-2/3 -mt-2 z-10"
		class:invisible={popupLexiconInvisible}
		data-popup="popupLexicon"
	>
		<Table
			class="table_lexicon font-mono text-left"
			source={lexiconTable}
			interactive={true}
			on:selected={(e) => {
				life.lexicon(e.detail[0])
			}}
		/>
	</div>

	<button
		class="btn-icon naked"
		title="Save Cells Table"
		on:click={() => {
			life.randomInit()
		}}
	>
		<svg>
			<use href="{SVG}#save" />
		</svg>
	</button>

	<label class="input w-20 py-2 rounded-r-none rounded-l-lg"
		><span>W: </span><input
			class="bg-transparent border-0 ring-0 focus:ring-0 focus:border-0 outline-none w-12"
			title="Change width of Cells Table"
			type="number"
			bind:value={$columns}
			on:input={resize}
			min="1"
		/>
	</label>
	<label class="input w-20 py-2 rounded-r-lg rounded-l-none"
		><span>H: </span><input
			class="bg-transparent border-0 ring-0 focus:ring-0 focus:border-0 outline-none w-12"
			title="Change height of Cells Table"
			type="number"
			bind:value={$rows}
			on:input={resize}
			min="1"
		/>
	</label>

	<button
		class="btn-icon naked"
		title="Toggle Edge Loop of Cells Table"
		on:click={() => ($edgeCell += 1)}
	>
		<svg class:primary-color={$edgeCell === -1}>
			<use href="{SVG}#{$edgeCell ? 'x' : 'repeat'}" />
		</svg>
	</button>

	<label class="btn-icon naked" title="Toggle Grid">
		<svg class:unactive={!$gridView}>
			<use href="{SVG}#grid" />
		</svg>
		<input type="checkbox" class="hidden" bind:checked={$gridView} />
	</label>

	<button
		class="btn-icon naked"
		title="Randomize Config"
		on:click={() => ($modal = ModalsHeader.Random)}
	>
		<svg>
			<use href="{SVG}#settings" />
		</svg>
	</button>
</nav>

<style>
	:global(
			.lexicon .table tbody tr td:nth-child(1),
			.lexicon .table tbody tr td:nth-child(3),
			.lexicon .table thead tr th:nth-child(3)
		) {
		text-align: right;
		padding-left: 2rem;
	}
</style>
