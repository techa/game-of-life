<script lang="ts">
	import { onMount } from 'svelte'
	import {
		life,
		ruleString,
		columns,
		rows,
		edgeCell,
		colorHue,
		penMode,
		modal,
		autoConway,
		templateLoaded,
		selectedColor,
	} from './store'

	import Slider from './generic/Slider.svelte'

	import SVG from '../resource/sprite.svg'

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

			life.tableSizing(
				axis === 'rows' ? $columns : val,
				axis === 'rows' ? val : $rows,
			)
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

	// for pen tool
	const cellStates = ['LIVE', 'UNDEAD', 'TOMB']
	let popupPenChooseInvisible = true
	const popupPenChoose: PopupSettings = {
		event: 'click',
		target: 'popupPenChoose',
		placement: 'bottom-start',
		state(e) {
			popupPenChooseInvisible = !e.state
		},
	}

	/**
	 * for scrollIntoView()
	 */
	let lexiconFirstOpen = true

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
		head: ['No.', 'Name', 'Size', 'Generation', 'Type'],
		body: lexicon.reduce((bodyArr, { n, d, g = 0, e = 0, l = 0 }, i) => {
			const [w, h] = d.split(/[-:]/)
			const size = `${w.padStart(2)}:${h.padStart(2)}`
			const ending = e === 1 ? 'stop' : e === 2 ? l + ' loop' : '-'
			const generation = g >= 300 ? '' : g + ''
			bodyArr.push([i + '', n, size, generation, ending])
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
		class="color-choose card w-48 shadow-xl -mt-2 p-2 z-10 bg-surface-900 rounded-sm"
		class:invisible={popupHueSliderInvisible}
		data-popup="popupHueSlider"
	>
		<div class="flex flex-row">
			<button
				class="btn-icon naked"
				title="Random Color Hue"
				on:click={() => ($colorHue = (Math.random() * 360) | 0)}
			>
				<svg>
					<use href="{SVG}#shuffle" />
				</svg>
			</button>
			<Slider
				class="h-11"
				--cell-size={'42px'}
				--background-color={$selectedColor}
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
	</div>

	<button class="btn-icon naked" title="Pen Tool" use:popup={popupPenChoose}>
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
	<div
		class="pen-choose card shadow-xl -mt-2 p-2 z-10 bg-surface-900 rounded-sm"
		class:invisible={popupPenChooseInvisible}
		data-popup="popupPenChoose"
	>
		<div class="flex flex-col">
			{#each [1, -1, -2] as penmode, i}
				<button
					class="w-full text-left"
					on:click={() => ($penMode = penmode)}
				>
					<div
						class="cell-sample w-3 h-3 inline-block"
						style:background-color={penmode > -2
							? $selectedColor
							: ''}
					>
						<svg>
							{#if penmode < 0}
								<use
									href="{SVG}#x"
									x="0"
									y="0"
									width="12px"
									height="12px"
									stroke-width="4px"
									stroke={penmode < -1 ? 'white' : '#2d1e33'}
								/>
							{/if}
						</svg>
					</div>
					{cellStates[i]}</button
				>
			{/each}
		</div>
	</div>

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
		on:click={() => {
			if (lexiconFirstOpen) {
				lexiconFirstOpen = false
				const rows = document.querySelectorAll('.table_lexicon tr')
				rows[lexiconIndex].scrollIntoView({ behavior: 'smooth' })
			}
		}}
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
			value={$columns}
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
			value={$rows}
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
		<svg class:variant-filled-primary={$edgeCell === -1}>
			<use href="{SVG}#{$edgeCell ? 'x' : 'repeat'}" />
		</svg>
	</button>

	<button
		class="btn-icon naked"
		title="Randomize Config"
		on:click={() => ($modal = true)}
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
