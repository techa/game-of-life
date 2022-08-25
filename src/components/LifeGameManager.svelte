<script lang="ts">
	import { rules, type Rule } from '$lib/rules'
	import { LifeEvent } from '$lib/LifeGame'

	import { life, table, columns, rows, generation, population } from './store'

	import SVG from '../resource/sprite.svg'

	let rule: Rule = 'B3/S23'
	$: life.setRule(rule)

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
	<label>
		<input bind:value={rule} placeholder="Born/Survival" />
	</label>
	<label>
		<select bind:value={rule}>
			{#each [...rules.entries()] as [name, _rule]}
				<option value={_rule} title={_rule}>{name}</option>
			{/each}
		</select>
	</label>

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

	<span>Generation: {$generation}</span>
	<span>Population: {$population}/{$rows * $columns}</span>
</nav>

<style>
	label {
		position: relative;
	}

	span {
		padding: 0 4px;
	}
</style>
