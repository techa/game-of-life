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

	let popupRuleListinVisible = true
	const popupRuleList: PopupSettings = {
		event: 'focus-click',
		target: 'popupRuleList',
		placement: 'bottom',
		closeQuery: '.table_rules',
		state(event) {
			popupRuleListinVisible = !event.state
		},
	}
	const meta = [...rules.entries()]
	const ruleTable: TableSource = {
		// A list of heading labels.
		head: ['B', 'S', 'C/G', 'Name'],
		body: meta.map(([v, name]) => {
			const rules = v.split('/')
			return [rules[0], rules[1], rules[2] || 'C2', name]
		}),
		meta,
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

	<div class="btn-group" use:popup={popupRuleList}>
		<input
			class="input w-48 text-center font-mono outline-none"
			placeholder="Born/Survival"
			title="Rule Input Space"
			bind:value={rule}
		/>
		<button
			class="choose_rule btn bg-initial w-48 justify-between bg-secondary-900"
			title="Choose Rule"
		>
			<span class="capitalize">{ruleName || 'Rule Name'}</span>
			<svg>
				<use href="{SVG}#chevron-down" />
			</svg>
		</button>
	</div>
	<div
		class="card shadow-xl overflow-y-scroll h-2/3 -mt-2 pb-4 z-10"
		class:invisible={popupRuleListinVisible}
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

<style>
	:global(.table tbody tr td:last-child) {
		white-space: nowrap;
		padding-right: 2rem;
	}
	:global(.table thead tr th:first-child, .table tbody tr td:first-child) {
		white-space: nowrap;
		padding-left: 2rem;
	}
</style>
