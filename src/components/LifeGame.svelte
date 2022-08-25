<script lang="ts">
	import { rules, type Rule } from '$lib/rules'
	import { LifeGame, LifeEvent, Cell } from '$lib/LifeGame'
	import { TableInitializer } from '$lib/TableInitializer'
	import { TableTransform } from '$lib/TableTransform'

	import GridTable from './GridTable.svelte'

	import SVG from '../resource/sprite.svg'
	import lexicon from '../resource/lexicon.json'
	import Patterns from '../resource/patterns.json'
	// import { patterns } from '../resource/patterns'
	// navigator.clipboard.writeText(
	// JSON.stringify(patterns, null, '\t'),
	// )

	const patterns = Patterns as unknown as [string, Cell[][]][]

	interface LifeGameEx extends TableTransform, TableInitializer {}
	@TableTransform
	@TableInitializer
	class LifeGameEx extends LifeGame {}

	const life = new LifeGameEx().init()
	let table = life.table
	let columns = life.columns
	let rows = life.rows

	let edgeCell = life.edgeCell

	let generation = life.generation
	let population = 0

	let playing = false
	let rule: Rule = 'B3/S23'
	let gridView = true
	let speed = life.speed

	let selectedColor = '#db4dff'

	$: life.setRule(rule)
	$: life.edgeCell = edgeCell

	life.on(LifeEvent.TABLE_UPDATE, () => {
		table = life.table
		generation = life.generation
		population = life.population
	})
	life.on(LifeEvent.START, () => {
		playing = true
	})
	life.on(LifeEvent.STOP, () => {
		playing = false
	})
</script>

<svelte:head>
	<title>LifeGame</title>
</svelte:head>

<section>
	<nav>
		<a href="https://github.com/techa/life-game">
			<svg style="stroke: #fff;">
				<use href="{SVG}#github" />
			</svg>
		</a>
		<label>
			<input type="color" bind:value={selectedColor} />
		</label>
		<label>
			<svg class:active={gridView}>
				<use href="{SVG}#grid" />
			</svg>
			<input type="checkbox" class="hidden" bind:checked={gridView} />
		</label>
		<label
			>W:
			<input
				type="number"
				bind:value={columns}
				on:change={() => life.tableSizing({ columns })}
			/>
		</label>
		<label
			>H:
			<input
				type="number"
				bind:value={rows}
				on:change={() => life.tableSizing({ rows })}
			/>
		</label>

		<button
			on:click={() => {
				edgeCell = edgeCell + 1 > 0 ? -2 : edgeCell + 1
			}}
		>
			<svg>
				<use href="{SVG}#repeat" />
			</svg>
			{#if edgeCell === -2}
				Tomb
			{:else if edgeCell === -1}
				Uudead
			{:else}
				Loop
			{/if}
		</button>

		<button
			on:click={() => {
				if (playing) {
					life.stop()
				} else {
					if (generation === 0 && population) {
						life.memory()
					}
					if (population) {
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
			<button
				on:click={() => {
					life.step()
				}}
				>step
			</button>
		{/if}
	</nav>

	<nav>
		<button
			on:click={() => {
				life.randomInit()
			}}
			>Random
		</button>
		<button
			on:click={() => {
				life.randomInit(null, 'edge')
			}}
			>randomne
		</button>
		<button
			on:click={() => {
				life.randomInit('edge', null)
			}}
			>randomen
		</button>
		<button
			on:click={() => {
				life.randomInit('edge', 'edge')
			}}
			>randomee
		</button>

		<button
			on:click={() => {
				life.undeadInit()
			}}
			>Undead
		</button>

		<button
			on:click={() => {
				if (playing) {
					life.stop()
				}

				life.init()
			}}
			>Clear
		</button>
		<button
			on:click={() => {
				if (playing) {
					life.stop()
				}
				life.reset()
			}}
			>Reset
		</button>
		<button
			on:click={() => {
				navigator.clipboard.writeText(life.memory())
			}}
			>Copy
		</button>

		<button
			on:click={() => {
				life.rotate()
			}}
			>Rotate
		</button>

		<button
			on:click={() => {
				life.reverse()
			}}
			>Reverse
		</button>

		<label>
			<select class="pulldown">
				{#each lexicon as lexico, i}
					<option
						value={i}
						on:click={() => {
							columns = life.columns
							rows = life.rows
							life.insert(lexicon[i])
							life.memory()
						}}>{i}</option
					>
				{/each}
			</select>
		</label>
		<label>
			<select class="pulldown">
				{#each patterns as [name, _rule], i}
					<option
						value={i}
						on:click={() => {
							columns = life.columns
							rows = life.rows
							life.insert(_rule)
							life.memory()
						}}>{name}</option
					>
				{/each}
			</select>
		</label>
	</nav>

	<nav>
		<label>
			Born/Survival
			<input bind:value={rule} />
		</label>
		<label>
			<select class="pulldown" bind:value={rule}>
				{#each [...rules.entries()] as [name, _rule]}
					<option value={_rule}>{name}</option>
				{/each}
			</select>
		</label>
		<span>Generation: {generation}</span>
		<span>Population: {population}/{rows * columns}</span>
	</nav>

	<GridTable {life} {table} {columns} {rows} {gridView} {selectedColor} />

	<footer />
</section>

<style>
	section {
		position: relative;
		width: 100%;
		height: 100%;
		text-align: center;

		/* display: flex; */
		/* align-items: center; */
		/* justify-content: space-between; */
	}
	nav {
		width: 100%;
		text-align: center;
		display: flex;
		justify-content: center;
	}
	input {
		width: 7rem;
		text-align: center;
		z-index: 2;
	}
	input[type='color'] {
		width: 2rem;
		border: none;
		padding: 0;
		border-radius: 8px;
	}
	input[type='number'] {
		width: 3rem;
	}
	label {
		position: relative;
	}
	.pulldown {
		width: auto;
		flex-wrap: wrap;
		flex-direction: columns;
	}

	span {
		padding: 0 4px;
	}
</style>
