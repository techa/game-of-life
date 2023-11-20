<script lang="ts">
	import { rules, type RuleString } from '$lib/rules'
	import { LifeEvent } from '$lib/LifeGame'

	import { life, columns, rows, generation, population } from './store'

	import SVG from '../resource/sprite.svg'

	import { popup } from '@skeletonlabs/skeleton'
	import type { PopupSettings } from '@skeletonlabs/skeleton'
	import { Table } from '@skeletonlabs/skeleton'
	import type { TableSource } from '@skeletonlabs/skeleton'

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

	const popupRuleList: PopupSettings = {
		event: 'focus-click',
		target: 'popupRuleList',
		placement: 'bottom',
		closeQuery: '.listbox-item',
	}
	const ruleTable: TableSource = {
		// A list of heading labels.
		head: ['Rule', 'Name'],
		body: [...rules.entries()],
	}
</script>

<nav class="w-full text-center flex justify-center">
	<button
		class="btn-icon"
		title="Reverse Rule"
		on:click={() => {
			rule = life.setRule(rule, true)
			ruleReverse = !ruleReverse
		}}
	>
		<svg class:active={ruleReverse}>
			<use href="{SVG}#exchange" />
		</svg>
	</button>

	<div id="rules" class="btn-group" use:popup={popupRuleList}>
		<input
			class="input w-48 text-center font-mono outline-none"
			placeholder="Born/Survival"
			title="Rule Input Space"
			bind:value={rule}
		/>
		<button
			class="btn bg-initial w-48 justify-between bg-secondary-900"
			title="Choose Rule"
		>
			<span class="capitalize">{ruleName || 'Rule Name'}</span>
			<svg>
				<use href="{SVG}#chevron-down" />
			</svg>
		</button>
	</div>

	<div
		class="card shadow-xl overflow-y-scroll h-2/3 -mt-2 pb-4 z-10 opacity-0 hidden"
		data-popup="popupRuleList"
	>
		<Table
			class="table_rules font-mono pr-4 -mr-4 text-left"
			source={ruleTable}
			interactive={true}
			on:selected={(e) => {
				const data = e.detail
				rule = life.setRule(data[0], ruleReverse)
				ruleName = data[1]
				document.getElementById('rules')?.blur()
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
			title="Skip Back and Reset Cells"
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
			title={playing ? 'Pause' : 'Play Start'}
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
			title={playing ? 'Speed control' : 'Advance to the next Frame'}
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

<div class="inline-block text-center w-full px-0 py-0">
	<span class="badge px-1 py-0"
		>Population: <span class="font-mono px-1 py-0"
			>{$population}/{$rows * $columns}</span
		>
	</span>
	<span class="badge px-1 py-0 bg-surface-600"
		>Generation: <span class="font-mono px-1 py-0">{$generation}</span>
	</span>
</div>
