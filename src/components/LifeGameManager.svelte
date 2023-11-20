<script lang="ts">
	import { rules, type RuleString } from '$lib/rules'
	import { LifeEvent } from '$lib/LifeGame'

	import { life, columns, rows, generation, population } from './store'
	import DropDown from './generic/DropDown.svelte'

	import SVG from '../resource/sprite.svg'

	import { popup } from '@skeletonlabs/skeleton'
	import type { PopupSettings } from '@skeletonlabs/skeleton'
	import { ListBox, ListBoxItem } from '@skeletonlabs/skeleton'
	import { Table } from '@skeletonlabs/skeleton'
	import type { TableSource } from '@skeletonlabs/skeleton'

	let rulelistOpen = false

	let rule: RuleString = 'B3/S23'
	let ruleName = "Conway's Life"
	let ruleReverse = false

	let playing = false
	let speed = life.speed

	life.on(LifeEvent.START, () => {
		playing = true
	})
	life.on(LifeEvent.STOP, () => {
		playing = false
	})

	//
	let comboboxValue: string

	const popupCombobox: PopupSettings = {
		event: 'focus-click',
		target: 'popupCombobox',
		placement: 'bottom',
		closeQuery: '.listbox-item',
	}
	const ruleTable: TableSource = {
		// A list of heading labels.
		head: ['Rule', 'Name'],
		body: [...rules.entries()],
	}
</script>

<nav>
	<button
		class="btn-icon"
		on:click={() => {
			rule = life.setRule(rule, true)
			ruleReverse = !ruleReverse
		}}
	>
		<svg class:active={ruleReverse}>
			<use href="{SVG}#refresh-cw" />
		</svg>
	</button>

	<div class="btn-group" use:popup={popupCombobox}>
		<input class="input" placeholder="Born/Survival" bind:value={rule} />
		<button class="btn bg-initial w-48 justify-between">
			<span class="capitalize">{ruleName || 'Rule Name'}</span>
			<span>
				<svg>
					<use href="{SVG}#chevron-down" />
				</svg>
			</span>
		</button>
	</div>

	<div
		class="card shadow-xl overflow-y-scroll h-2/3 z-10 opacity-0"
		data-popup="popupCombobox"
	>
		<Table
			source={ruleTable}
			interactive={true}
			on:selected={(e) => {
				const data = e.detail
				rule = life.setRule(data[0], ruleReverse)
				ruleName = data[1]
				rulelistOpen = false
			}}
		/>

		<p class="list-footer">
			and
			<a
				class="anchor"
				href="https://conwaylife.com/wiki/List_of_Life-like_cellular_automata"
				target="_blocked"
			>
				more
			</a>
			and
			<a
				class="anchor"
				href="https://conwaylife.com/wiki/List_of_Generations_rules"
				target="_blocked"
			>
				more.</a
			>
		</p>
		<div class="arrow bg-surface-100-800-token" />
	</div>

	<div class="player btn-group bg-initial primary-color">
		<button
			class="skip-back"
			on:click={() => {
				life.reset()
			}}
		>
			<svg>
				<use href="{SVG}#skip-back" />
			</svg>
		</button>
		<button
			class="play"
			on:click={() => {
				if (playing) {
					life.stop()
				} else {
					life.start()
				}
			}}
		>
			<svg>
				<use href="{SVG}#{playing ? 'pause' : 'play'}" />
			</svg>
		</button>
		<button
			class="speed-step"
			on:click={() => {
				if (playing) {
					life.speedIndex++
					speed = life.speed
				} else {
					life.step()
				}
			}}
		>
			{#if playing}
				x{speed}
			{:else}
				<svg>
					<use href="{SVG}#step" />
				</svg>
			{/if}
		</button>
	</div>
</nav>

<div class="numbers">
	<span class="badge variant-filled"
		>Generation: <span class="numbers">{$generation}</span></span
	><span class="badge"
		>Population: <span class="numbers">{$population}</span>/ {$rows *
			$columns}</span
	>
</div>

<style>
	span {
		padding: 0 4px;
	}
	input {
		width: 12rem;
		text-align: center;
	}

	.numbers {
		display: inline-block;
		text-align: right;
		width: 100%;
	}
</style>
