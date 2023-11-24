<script lang="ts">
	import { onMount } from 'svelte'
	import {
		life,
		ruleString,
		columns,
		rows,
		edgeCell,
		colorHue,
		gridShow,
		gridCursor,
		penMode,
		modal,
		ModalsHeader,
		autoConway,
		templateLoaded,
	} from './store'

	import Slider from './generic/Slider.svelte'

	import SVG from '../resource/sprite.svg'
	import { LifeEvent } from '$lib/LifeGame.js'

	import lexicon from '../resource/lexicon.min.json'

	import { popup } from '@skeletonlabs/skeleton'
	import Table from './generic/Table.svelte'
	import type { PopupSettings, TableSource } from '@skeletonlabs/skeleton'

	function validateResize(axis: 'rows' | 'columns') {
		return (
			e: Event & {
				currentTarget: EventTarget & HTMLInputElement
			},
		) => {
			const val = +e.currentTarget.value | 0
			if (val < 1 && e.currentTarget) {
				e.currentTarget.value = life[axis] + ''
			}
			life.tableSizing($columns, $rows)
		}
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

	// for pen tool tile-attribute
	const cellStates = ['disabled', 'LIVE', 'UNDEAD', 'TOMB']

	// Lexicon
	let lexiconIndex = (Math.random() * lexicon.length) | 0
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

	onMount(() => {
		life.lexicon(lexicon[lexiconIndex].d)
		$templateLoaded = true
	})
</script>

<nav class="w-full p-2 text-center flex justify-center">
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
			value={colorHue}
			gradient={[
				'#ffa6e6',
				'#ffba87',
				'#ffe053',
				'#90fa7d',
				'#00ffe0',
				'#00feff',
				'#8ae7ff',
				'#ffc0ff',
				'#ffa6e6',
			]}
		/>
	</div>

	<button
		class="btn-icon naked"
		title="Pen Tool ({cellStates[$penMode]})"
		on:click={() => penMode.next()}
	>
		<svg class:unactive={!$penMode} class:active={Math.abs($penMode) === 1}>
			<use href="{SVG}#pencil" />
			{#if $penMode < 0}
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
		class="btn-icon naked hidden md:inline-flex"
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
		class="btn-icon naked hidden md:inline-flex"
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
		class="btn-icon naked hidden md:inline-flex"
		title="Reverse Cells Cell-Live <--> Cell-Dead"
		on:click={() => {
			life.reverse()
			$templateLoaded = false
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
			$templateLoaded = false
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
		<svg class:active={$templateLoaded}>
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
			bind:selectingRowIndex={lexiconIndex}
			on:selected={(e) => {
				life.lexicon(e.detail[0])
				$templateLoaded = true
				if ($autoConway) {
					$ruleString = 'B3/S23'
				}
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

	<label
		class="input font-mono inline-flex w-20 py-2 pl-2 rounded-r-none rounded-l-lg break-inside-avoid"
		><span>W: </span><input
			class="bg-transparent border-0 ring-0 focus:ring-0 focus:border-0 outline-none w-12"
			title="Change width of Cells Table"
			type="number"
			min="1"
			bind:value={$columns}
			on:input={validateResize('columns')}
			on:blur={validateResize('columns')}
			on:keydown={(e) => {
				switch (e.key) {
					case 'Enter':
					case 'Tab':
						validateResize('columns')
						break
				}
			}}
		/>
	</label>
	<label
		class="input font-mono inline-flex w-20 py-2 pr-2 rounded-r-lg rounded-l-none break-inside-avoid"
		>H: <input
			class="bg-transparent border-0 ring-0 focus:ring-0 focus:border-0 outline-none w-12"
			title="Change height of Cells Table"
			type="number"
			min="1"
			bind:value={$rows}
			on:input={validateResize('rows')}
			on:blur={validateResize('rows')}
			on:keydown={(e) => {
				switch (e.key) {
					case 'Enter':
					case 'Tab':
						validateResize('rows')
						break
				}
			}}
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
		<svg class:unactive={!$gridCursor}>
			<use href="{SVG}#search" />
		</svg>
		<input type="checkbox" class="hidden" bind:checked={$gridCursor} />
	</label>

	<label class="btn-icon naked" title="Toggle Grid">
		<svg class:unactive={!$gridShow}>
			<use href="{SVG}#grid" />
		</svg>
		<input type="checkbox" class="hidden" bind:checked={$gridShow} />
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
