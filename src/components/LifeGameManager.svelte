<script lang="ts">
	import { rules, type RuleString } from '$lib/rules'
	import { LifeEvent } from '$lib/LifeGame'

	import { life, table, columns, rows, generation, population } from './store'
	import DropDown from './DropDown.svelte'

	import SVG from '../resource/sprite.svg'

	let rulelistOpen = false

	let rule: RuleString = 'B3/S23'
	let ruleName: string = "Conway's Life"
	$: life.rule = rule

	let playing = false
	let speed = life.speed

	life.on(LifeEvent.START, () => {
		playing = true
	})
	life.on(LifeEvent.STOP, () => {
		playing = false
	})

	life.on(LifeEvent.TABLE_UPDATE, () => {
		$table = life.table
		$generation = life.generation
		$population = life.population
	})
</script>

<nav>
	<DropDown bind:open={rulelistOpen}>
		<div slot="trigger">
			<input
				placeholder="Born/Survival"
				bind:value={rule}
				on:focusout={() => ''}
			/>
			<button class="btn-right">
				{ruleName}
				<svg>
					<use href="{SVG}#chevron-down" />
				</svg>
			</button>
		</div>
		<!-- svelte-ignore component-name-lowercase -->
		<table class="rule_list">
			{#each [...rules.entries()] as [name, _rule]}
				<tr
					class="rule_list-item"
					class:selected={rule === _rule}
					on:click={() => {
						rule = _rule
						ruleName = name
						rulelistOpen = false
					}}
				>
					<td>{_rule}</td>
					<td>{name}</td>
				</tr>
			{/each}
		</table>
	</DropDown>

	<button
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
			on:click={() => {
				life.tpfsIndex++
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
