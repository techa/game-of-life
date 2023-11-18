<script lang="ts">
	import { rules, type RuleString } from '$lib/rules'
	import { LifeEvent } from '$lib/LifeGame'

	import { life, columns, rows, generation, population } from './store'
	import DropDown from './generic/DropDown.svelte'

	import SVG from '../resource/sprite.svg'

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
</script>

<nav>
	<button
		on:click={() => {
			rule = life.setRule(rule, true)
			ruleReverse = !ruleReverse
		}}
	>
		<svg class:active={ruleReverse}>
			<use href="{SVG}#refresh-cw" />
		</svg>
	</button>

	<DropDown bind:open={rulelistOpen} style="background-color:var(--black);">
		<div slot="trigger">
			<input
				placeholder="Born/Survival"
				bind:value={rule}
				on:focusout={() => {
					rule = life.setRule(rule, ruleReverse)
					ruleName = rules.get(rule) || ''
				}}
				on:keydown={(e) => {
					switch (e.code) {
						case 'Enter':
						case 'Tab':
							rule = life.setRule(rule, ruleReverse)
							ruleName = rules.get(rule) || ''
							break
					}
				}}
			/>
			<button class="btn-right">
				{ruleName}
				<svg>
					<use href="{SVG}#chevron-down" />
				</svg>
			</button>
		</div>

		<table class="rule_list">
			{#each [...rules.entries()] as [_rule, name]}
				<tr
					class="rule_list-item"
					class:selected={rule === _rule}
					on:click={() => {
						rule = life.setRule(_rule, ruleReverse)
						ruleName = name
						rulelistOpen = false
					}}
				>
					<td>{_rule}</td>
					<td>{name}</td>
				</tr>
			{/each}
		</table>
		<p class="list-footer">
			and
			<a
				href="https://conwaylife.com/wiki/List_of_Life-like_cellular_automata"
				target="_blocked"
			>
				more
			</a>
			and
			<a
				href="https://conwaylife.com/wiki/List_of_Generations_rules"
				target="_blocked"
			>
				more.</a
			>
		</p>
	</DropDown>

	<button
		class="player play primary-color"
		on:click={() => {
			if (playing) {
				life.stop()
			} else {
				if ($generation === 0 && $population) {
					life.memory()
				}
				if ($population) {
					life.start()
				}
			}
		}}
	>
		<svg class:active={playing} style:stroke={'black'}>
			<use href="{SVG}#{playing ? 'pause' : 'play'}" />
		</svg>{playing ? 'Stop' : 'Start'}</button
	>
	{#if playing}
		<button
			class="player speed"
			on:click={() => {
				life.speedIndex++
				speed = life.speed
			}}
			>x{speed}
		</button>
	{:else}
		<button on:click={() => life.step()}>Step</button>
	{/if}

	<span>Generation: <span class="numbers">{$generation}</span></span>
	<span
		>Population: <span class="numbers">{$population}</span>/ {$rows *
			$columns}</span
	>
</nav>

<style>
	span {
		padding: 0 4px;
	}
	input {
		width: 8rem;
		text-align: center;
	}
	div {
		display: flex;
	}
	.btn-right {
		width: 8rem;
	}
	.rule_list {
		background-color: var(--black);
		font-size: 0.9rem;
	}
	.rule_list-item:hover {
		background-color: #333;
	}
	.rule_list .selected {
		background-color: #444;
	}

	.numbers {
		display: inline-block;
		text-align: right;
		width: 2rem;
	}
</style>
