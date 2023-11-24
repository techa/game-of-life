<script lang="ts">
	import { rules } from '$lib/rules.js'
	import { LifeEvent } from '$lib/LifeGame.js'

	import {
		life,
		ruleString,
		ruleName,
		columns,
		rows,
		generation,
		population,
	} from './store'

	import SVG from '../resource/sprite.svg'

	import { popup } from '@skeletonlabs/skeleton'
	import type { PopupSettings } from '@skeletonlabs/skeleton'
	import { Table } from '@skeletonlabs/skeleton'
	import type { TableSource } from '@skeletonlabs/skeleton'

	function ruleInput(
		e: Event & {
			currentTarget: EventTarget & HTMLInputElement
		},
	) {
		$ruleString = life.setRule(e.currentTarget.value)
	}
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
		placement: 'bottom-start',
		closeQuery: '.table_rules',
		state(event) {
			popupRuleListinVisible = !event.state
		},
	}
	const meta = [...rules.entries()]
	const ruleTable: TableSource = {
		// A list of heading labels.
		head: ['Name', 'B', 'S', 'C/G'],
		body: meta.map(([v, name]) => {
			const rules = v.split('/')
			return [name, rules[0], rules[1], rules[2] || 'C2']
		}),
		meta,
	}
</script>

<nav class="w-full text-center flex justify-center">
	<div class="flex mr-4 bg-tertiary-700 rounded-full w-96">
		<button
			class="choose_rule popup-trigger btn bg-initial justify-between"
			title="Choose Rule"
			use:popup={popupRuleList}
		>
			<span class="capitalize">{$ruleName || '--'}</span>
		</button>
		{#if !$ruleName}
			<button
				class="choose_rule popup-trigger btn bg-initial justify-between"
				title="Rule Save"
			>
				<svg>
					<use href="{SVG}#save" />
				</svg>
			</button>
		{/if}
		<input
			class="input w-52 text-center font-mono outline-none rounded-none"
			placeholder="Born/Survival"
			title="Rule Input Space"
			bind:value={$ruleString}
			on:blur={ruleInput}
			on:keydown={(e) => {
				switch (e.key) {
					case 'Enter':
					case 'Space':
					case 'Tab':
						$ruleString = life.setRule(e.currentTarget.value)
						break
				}
			}}
		/>
		<button
			class="btn-icon pr-4 pl-2 bg-surface-700 rounded-l-none"
			title="Reverse Rule"
			on:click={() => {
				$ruleString = life.setRule($ruleString, true)
				ruleReverse = !ruleReverse
			}}
		>
			<svg class:active={ruleReverse}>
				<use href="{SVG}#exchange" />
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
				$ruleString = life.setRule(data[0], ruleReverse)
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

	<div class="player variant-filled-primary flex rounded-full">
		<button
			class="skip-back btn-icon"
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
			class="play btn-icon"
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
			class="speed-step btn-icon"
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
				<span class="font-bold font-mono text-xl mr-2">x{speed}</span>
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
